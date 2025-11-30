import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import QRCode from "qrcode"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { products } = await request.json()

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı" },
        { status: 400 }
      )
    }

    let count = 0
    const errors: string[] = []

    for (const product of products) {
      try {
        // İkas CSV formatı: Name, SKU, Description, Barcode List, vb.
        const productName = product.Name || product.name
        const productSku = product.SKU || product.sku
        const productDescription = product.Description || product.description
        const productBarcode = product["Barcode List"] || product.barcode

        if (!productName || !productSku) {
          errors.push(`${productSku || "Bilinmeyen"}: Eksik bilgi (Name veya SKU)`)
          continue
        }

        // SKU kontrolü
        const existing = await prisma.product.findUnique({
          where: { sku: productSku },
        })

        if (existing) {
          errors.push(`${productSku}: Zaten mevcut`)
          continue
        }

        // HTML'den temizlenmiş açıklama (basit temizleme)
        let cleanDescription = productDescription || null
        if (cleanDescription) {
          // HTML tag'lerini kaldır (basit)
          cleanDescription = cleanDescription
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 1000) // Maksimum 1000 karakter
        }

        // Kategori işleme (Categories kolonu: "Gümüş Takılar>Gümüş Yüzük>Gümüş Taşsız Yüzük")
        let categoryId: string | null = null
        const categoriesStr = product.Categories || product.categories
        if (categoriesStr) {
          // Hiyerarşik kategorileri parse et, en son kategoriyi kullan
          const categoryParts = categoriesStr.split('>').map((c: string) => c.trim()).filter(Boolean)
          if (categoryParts.length > 0) {
            const categoryName = categoryParts[categoryParts.length - 1] // En son kategori
            
            // Kategoriyi bul veya oluştur
            const category = await prisma.category.upsert({
              where: { name: categoryName },
              update: {},
              create: {
                name: categoryName,
                description: categoryParts.length > 1 ? categoryParts.join(' > ') : null,
              },
            })
            categoryId = category.id
          }
        }

        // QR kod oluştur
        const qrCodeData = JSON.stringify({
          type: "product",
          sku: productSku,
        })
        const qrCode = await QRCode.toDataURL(qrCodeData)

        await prisma.product.create({
          data: {
            name: productName,
            sku: productSku,
            weight: product.weight ? parseFloat(product.weight) : null,
            description: cleanDescription,
            categoryId: categoryId,
            qrCode: qrCode,
          },
        })

        count++
      } catch (error) {
        const sku = product.SKU || product.sku || "Bilinmeyen"
        errors.push(`${sku}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return NextResponse.json({
      count,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

