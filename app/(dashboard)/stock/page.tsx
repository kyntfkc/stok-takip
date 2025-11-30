import { auth } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { StockOperations } from "@/components/stock/StockOperations"
import { StockHistory } from "@/components/stock/StockHistory"
import { prisma } from "@/lib/prisma"

export default async function StockPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const transactions = await prisma.stockTransaction.findMany({
    take: 50,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Stok Yönetimi
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Stok giriş ve çıkış işlemlerini yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockOperations />
        <StockHistory transactions={transactions} />
      </div>
    </div>
  )
}

