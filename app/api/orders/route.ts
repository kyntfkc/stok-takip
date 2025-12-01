import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import type { ProductionStage, OrderStatus } from "@/lib/types"

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
    })
  ).min(1),
})

export const revalidate = 60 // 60 saniye cache

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Prisma.OrderWhereInput = {}
    if (status) {
      // OrderStatus enum değerlerini kontrol et
      const validStatuses = Object.values(OrderStatus) as string[]
      if (validStatuses.includes(status)) {
        where.status = status as OrderStatus
      } else {
        return NextResponse.json(
          { error: "Geçersiz status değeri", details: `Geçerli değerler: ${validStatuses.join(", ")}` },
          { status: 400 }
        )
      }
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            status: true,
            note: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
                currentStock: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Orders fetch error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error message:", errorMessage)
    console.error("Error stack:", errorStack)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: errorMessage,
        message: "Siparişler yüklenirken bir hata oluştu"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    let session
    try {
      session = await getServerSession()
    } catch (authError) {
      console.error("Auth error in orders API:", authError)
      return NextResponse.json(
        { error: "Authentication error", details: authError instanceof Error ? authError.message : String(authError) },
        { status: 500 }
      )
    }

    if (!session) {
      console.error("Orders API: No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user?.id) {
      console.error("Orders API: No user ID in session", session)
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Order creation request body:", body)
    console.log("Session user ID:", session.user.id)
    
    const validatedData = orderSchema.parse(body)
    console.log("Validated data:", validatedData)

    // Ürünlerin var olduğunu kontrol et
    const productIds = validatedData.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true
      }
    })

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id)
      const missingIds = productIds.filter(id => !foundIds.includes(id))
      console.error("Some products not found:", missingIds)
      return NextResponse.json(
        { 
          error: "Ürün bulunamadı", 
          details: `Şu ürün ID'leri bulunamadı: ${missingIds.join(", ")}`,
          message: "Lütfen geçerli ürünler seçin"
        },
        { status: 404 }
      )
    }

    // User'ın var olduğunu kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      console.error("User not found in database:", session.user.id)
      console.error("Session user:", session.user)
      // userId nullable olduğu için null gönderebiliriz
      // return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Üretim talebi numarası oluştur (otomatik)
    let orderNumber = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Sipariş numarası kontrolü (çok nadir olsa da çakışma olabilir)
    let existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    })

    // Eğer varsa yeni numara oluştur
    while (existingOrder) {
      orderNumber = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      existingOrder = await prisma.order.findUnique({
        where: { orderNumber },
      })
    }

    // Üretim talebi oluştur
    // userId nullable olduğu için, eğer user yoksa null gönder
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: null,
        status: "NEW",
        userId: user ? user.id : null,
        orderItems: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            status: ProductionStage.TO_PRODUCE,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    console.log("Order created successfully:", order.id)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.issues)
      return NextResponse.json(
        { 
          error: "Geçersiz veri", 
          details: error.issues,
          message: "Lütfen tüm alanları doğru şekilde doldurun"
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error message:", errorMessage)
    console.error("Error stack:", errorStack)
    
    // Prisma hatalarını kontrol et
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code)
      console.error("Prisma error meta:", error.meta)
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { 
            error: "Veritabanı hatası", 
            details: "Bu sipariş numarası zaten kullanılıyor",
            message: "Lütfen tekrar deneyin"
          },
          { status: 409 }
        )
      }
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { 
            error: "Veritabanı hatası", 
            details: "Geçersiz referans (ürün veya kullanıcı bulunamadı)",
            message: "Lütfen geçerli veriler seçin"
          },
          { status: 400 }
        )
      }
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("Prisma validation error:", error.message)
      return NextResponse.json(
        { 
          error: "Veritabanı doğrulama hatası", 
          details: error.message,
          message: "Gönderilen veriler geçersiz"
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: errorMessage,
        message: "Üretim talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      },
      { status: 500 }
    )
  }
}

