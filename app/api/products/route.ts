import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import QRCode from "qrcode"

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  weight: z.number().nullable().optional(),
  description: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    let session
    try {
      session = await getServerSession()
    } catch (authError) {
      console.error("Auth error in products API:", authError)
      return NextResponse.json(
        { error: "Authentication error", details: authError instanceof Error ? authError.message : String(authError) },
        { status: 500 }
      )
    }

    if (!session) {
      console.error("Products API: No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Products fetch error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error stack:", errorStack)
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // SKU kontrolü
    const existingProduct = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Bu SKU zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // QR kod oluştur
    const qrCodeData = JSON.stringify({
      type: "product",
      sku: validatedData.sku,
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        sku: validatedData.sku,
        weight: validatedData.weight || null,
        description: validatedData.description || null,
        qrCode: qrCode,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Product creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
