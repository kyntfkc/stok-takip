import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkAndNotifyLowStock } from "@/lib/notifications/telegram"

const transactionSchema = z.object({
  productId: z.string(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().positive(),
  reason: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    // Ürünü kontrol et
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      )
    }

    // Çıkış işleminde stok kontrolü
    if (validatedData.type === "OUT" && product.currentStock < validatedData.quantity) {
      return NextResponse.json(
        { error: "Yetersiz stok" },
        { status: 400 }
      )
    }

    // Transaction oluştur ve stok güncelle
    const newStock =
      validatedData.type === "IN"
        ? product.currentStock + validatedData.quantity
        : product.currentStock - validatedData.quantity

    await prisma.$transaction([
      prisma.stockTransaction.create({
        data: {
          productId: validatedData.productId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          reason: validatedData.reason || null,
          userId: session.user.id,
        },
      }),
      prisma.product.update({
        where: { id: validatedData.productId },
        data: { currentStock: newStock },
      }),
    ])

    // Düşük stok kontrolü ve bildirim gönderme (asenkron, hata durumunda işlemi etkilemez)
    checkAndNotifyLowStock(validatedData.productId).catch((error) => {
      console.error("Bildirim gönderme hatası:", error)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Stock transaction error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

