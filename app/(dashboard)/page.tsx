import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { unstable_cache } from "next/cache"
import { LowStockAlert } from "@/components/dashboard/LowStockAlert"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { StockStats } from "@/components/dashboard/StockStats"
import { prisma } from "@/lib/prisma"
import { Skeleton } from "@/components/ui/skeleton"
import type { StockTransactionType } from "@/lib/types"

// Cache'lenmiş dashboard stats fonksiyonu
const getCachedDashboardStats = unstable_cache(
  async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: {
          currentStock: true,
        },
      }),
      prisma.product.findMany({
        where: {
          currentStock: {
            lte: 10,
          },
        },
        orderBy: {
          currentStock: "asc",
        },
        take: 10,
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          imageUrl: true,
        },
      }),
      prisma.stockTransaction.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              imageUrl: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.stockTransaction.findMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
        select: {
          type: true,
          quantity: true,
        },
      }),
    ])
  },
  ["dashboard-stats"],
  {
    revalidate: 60, // 60 saniye cache
    tags: ["dashboard"],
  }
)

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // Cache'lenmiş stats'ı al
  const [
    totalProducts,
    totalStock,
    lowStockProducts,
    recentTransactions,
    todayTransactions,
  ] = await getCachedDashboardStats()

  // Günlük istatistikleri hesapla
  const todayIn = todayTransactions
    .filter((t: { type: StockTransactionType; quantity: number }) => t.type === "IN")
    .reduce((sum: number, t: { type: StockTransactionType; quantity: number }) => sum + t.quantity, 0)
  
  const todayOut = todayTransactions
    .filter((t: { type: StockTransactionType; quantity: number }) => t.type === "OUT")
    .reduce((sum: number, t: { type: StockTransactionType; quantity: number }) => sum + t.quantity, 0)

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Stok durumunu ve son hareketleri takip edin
        </p>
      </div>

      <StockStats
        totalProducts={totalProducts}
        totalStock={totalStock._sum.currentStock || 0}
        lowStockCount={lowStockProducts.length}
        todayIn={todayIn}
        todayOut={todayOut}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <LowStockAlert products={lowStockProducts} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RecentTransactions transactions={recentTransactions} />
        </Suspense>
      </div>
    </>
  )
}

