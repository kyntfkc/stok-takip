import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportsDashboard } from "@/components/reports/ReportsDashboard"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export default async function ReportsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // Günlük, haftalık, aylık veriler
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Tamamlanan siparişler
  const dailyOrders = await prisma.order.count({
    where: {
      status: "COMPLETED",
      completedAt: {
        gte: today,
      },
    },
  })

  const weeklyOrders = await prisma.order.count({
    where: {
      status: "COMPLETED",
      completedAt: {
        gte: weekStart,
      },
    },
  })

  const monthlyOrders = await prisma.order.count({
    where: {
      status: "COMPLETED",
      completedAt: {
        gte: monthStart,
      },
    },
  })

  // En çok üretilen ürünler
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      status: "COMPLETED",
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 10,
  })

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item: { productId: string; _sum: { quantity: number | null } }) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, sku: true },
      })
      return {
        ...item,
        product,
      }
    })
  )

  // Günlük üretim grafiği için veri (son 30 gün)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const dailyProduction = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      completedAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      completedAt: true,
      orderItems: {
        select: {
          quantity: true,
        },
      },
    },
  })

  const dailyStats = dailyProduction.reduce((acc: Record<string, number>, order: { completedAt: Date | null; orderItems: Array<{ quantity: number }> }) => {
    if (!order.completedAt) return acc
    const dateStr = order.completedAt.toISOString().split("T")[0] // yyyy-MM-dd formatı
    const total = order.orderItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
    acc[dateStr] = (acc[dateStr] || 0) + total
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Raporlar
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Üretim istatistikleri ve raporları
        </p>
      </div>

      <ReportsDashboard
        dailyOrders={dailyOrders}
        weeklyOrders={weeklyOrders}
        monthlyOrders={monthlyOrders}
        topProducts={topProductsWithDetails}
        dailyStats={dailyStats}
      />
    </div>
  )
}

