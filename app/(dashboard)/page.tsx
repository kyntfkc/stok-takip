import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StockOverview } from "@/components/dashboard/StockOverview"
import { LowStockAlert } from "@/components/dashboard/LowStockAlert"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { StockStats } from "@/components/dashboard/StockStats"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // Stok istatistikleri
  const totalProducts = await prisma.product.count()
  const totalStock = await prisma.product.aggregate({
    _sum: {
      currentStock: true,
    },
  })

  const lowStockProducts = await prisma.product.findMany({
    where: {
      currentStock: {
        lte: 10, // 10 ve altı düşük stok
      },
    },
    orderBy: {
      currentStock: "asc",
    },
    take: 10,
  })

  // Son stok hareketleri
  const recentTransactions = await prisma.stockTransaction.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        select: {
          name: true,
          sku: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  // Günlük stok hareketleri
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayTransactions = await prisma.stockTransaction.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
  })

  const todayIn = todayTransactions
    .filter((t: { type: string; quantity: number }) => t.type === "IN")
    .reduce((sum: number, t: { type: string; quantity: number }) => sum + t.quantity, 0)
  
  const todayOut = todayTransactions
    .filter((t: { type: string; quantity: number }) => t.type === "OUT")
    .reduce((sum: number, t: { type: string; quantity: number }) => sum + t.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
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
        <LowStockAlert products={lowStockProducts} />
        <RecentTransactions transactions={recentTransactions} />
      </div>

      <div className="mt-6">
        <StockOverview />
      </div>
    </div>
  )
}

