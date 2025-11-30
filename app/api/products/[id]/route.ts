import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  weight: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockTransactions: {
          take: 20,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const validatedData = productUpdateSchema.parse(body)

    // Ürün var mı kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      )
    }

    // SKU değiştiriliyorsa, başka bir üründe kullanılıyor mu kontrol et
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: validatedData.sku },
      })

      if (skuExists) {
        return NextResponse.json(
          { error: "Bu SKU zaten kullanılıyor" },
          { status: 400 }
        )
      }
    }

    // Ürünü güncelle
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.sku && { sku: validatedData.sku }),
        ...(validatedData.weight !== undefined && { weight: validatedData.weight }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.categoryId !== undefined && { categoryId: validatedData.categoryId }),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Product update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

