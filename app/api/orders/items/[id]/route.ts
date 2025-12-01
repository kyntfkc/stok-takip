import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const noteSchema = z.object({
  note: z.string().nullable(),
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
    const validatedData = noteSchema.parse(body)

    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: "Sipariş kalemi bulunamadı" },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: { note: validatedData.note },
      include: {
        product: true,
        order: true,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Note update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

