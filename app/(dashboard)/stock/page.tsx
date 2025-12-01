import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StockOperations } from "@/components/stock/StockOperations"
import { StockHistory } from "@/components/stock/StockHistory"
import { prisma } from "@/lib/prisma"

export default async function StockPage() {
  const session = await getServerSession()

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
    <>
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
    </>
  )
}

