import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

enum ProductionStage {
  TO_PRODUCE = "TO_PRODUCE",
  WAX_PRESSING = "WAX_PRESSING",
  WAX_READY = "WAX_READY",
  CASTING = "CASTING",
  BENCH = "BENCH",
  POLISHING = "POLISHING",
  PACKAGING = "PACKAGING",
  COMPLETED = "COMPLETED",
}

const stageSchema = z.object({
  stage: z.nativeEnum(ProductionStage),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = stageSchema.parse(body)

    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: true,
      },
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: "Sipariş kalemi bulunamadı" },
        { status: 404 }
      )
    }

    // Aşama geçmişine ekle
    await prisma.productionStageHistory.create({
      data: {
        orderItemId: id,
        stage: validatedData.stage,
      },
    })

    // Sipariş kalemi aşamasını güncelle
    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: { status: validatedData.stage },
      include: {
        product: true,
        order: true,
      },
    })

    // Eğer tüm kalemler tamamlandıysa siparişi tamamlandı olarak işaretle
    if (validatedData.stage === "COMPLETED") {
      const allItems = await prisma.orderItem.findMany({
        where: { orderId: orderItem.orderId },
      })

      const allCompleted = allItems.every((item: { status: string }) => item.status === "COMPLETED")

      if (allCompleted) {
        await prisma.order.update({
          where: { id: orderItem.orderId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        })

        // Stokları güncelle
        for (const item of allItems) {
          await prisma.$transaction([
            prisma.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  increment: item.quantity,
                },
              },
            }),
            prisma.stockTransaction.create({
              data: {
                productId: item.productId,
                type: "IN",
                quantity: item.quantity,
                reason: `Sipariş tamamlandı: ${orderItem.order.orderNumber}`,
                userId: session.user.id,
              },
            }),
          ])
        }
      }
    } else {
      // Üretime başlandıysa sipariş durumunu güncelle
      if (orderItem.order.status === "NEW") {
        await prisma.order.update({
          where: { id: orderItem.orderId },
          data: { status: "IN_PRODUCTION" },
        })
      }
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Stage update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

