import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { ProductionStage } from "@prisma/client"

const bulkStageSchema = z.object({
  itemIds: z.array(z.string()).min(1, "En az bir ürün seçilmelidir"),
  stage: z.nativeEnum(ProductionStage),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bulkStageSchema.parse(body)

    // Tüm item'ları kontrol et
    const items = await prisma.orderItem.findMany({
      where: {
        id: {
          in: validatedData.itemIds,
        },
      },
      include: {
        order: true,
      },
    })

    if (items.length !== validatedData.itemIds.length) {
      return NextResponse.json(
        { error: "Bazı ürünler bulunamadı" },
        { status: 404 }
      )
    }

    // Transaction içinde toplu güncelleme
    const result = await prisma.$transaction(async (tx) => {
      // Her item için aşama geçmişine ekle
      await Promise.all(
        items.map((item) =>
          tx.productionStageHistory.create({
            data: {
              orderItemId: item.id,
              stage: validatedData.stage,
            },
          })
        )
      )

      // Tüm item'ların aşamasını güncelle
      await tx.orderItem.updateMany({
        where: {
          id: {
            in: validatedData.itemIds,
          },
        },
        data: {
          status: validatedData.stage,
        },
      })

      // Eğer COMPLETED ise, siparişleri kontrol et
      if (validatedData.stage === "COMPLETED") {
        const orderIds = [...new Set(items.map((item) => item.orderId))]

        for (const orderId of orderIds) {
          const orderItems = await tx.orderItem.findMany({
            where: { orderId },
          })

          const allCompleted = orderItems.every(
            (item) => item.status === "COMPLETED"
          )

          if (allCompleted) {
            const order = await tx.order.findUnique({
              where: { id: orderId },
            })

            if (order) {
              await tx.order.update({
                where: { id: orderId },
                data: {
                  status: "COMPLETED",
                  completedAt: new Date(),
                },
              })

              // Stokları güncelle
              for (const item of orderItems) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: {
                    currentStock: {
                      increment: item.quantity,
                    },
                  },
                })

                await tx.stockTransaction.create({
                  data: {
                    productId: item.productId,
                    type: "IN",
                    quantity: item.quantity,
                    reason: `Sipariş tamamlandı: ${order.orderNumber}`,
                    userId: session.user.id,
                  },
                })
              }
            }
          }
        }
      } else {
        // Üretime başlandıysa sipariş durumunu güncelle
        const orderIds = [...new Set(items.map((item) => item.orderId))]

        for (const orderId of orderIds) {
          const order = await tx.order.findUnique({
            where: { id: orderId },
          })

          if (order && order.status === "NEW") {
            await tx.order.update({
              where: { id: orderId },
              data: { status: "IN_PRODUCTION" },
            })
          }
        }
      }

      // Güncellenmiş item'ları döndür
      return await tx.orderItem.findMany({
        where: {
          id: {
            in: validatedData.itemIds,
          },
        },
        include: {
          product: true,
          order: true,
        },
      })
    })

    return NextResponse.json({
      success: true,
      updated: result.length,
      items: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Bulk stage update error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    )
  }
}

