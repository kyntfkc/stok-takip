import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductsTable } from "@/components/products/ProductsTable"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      category: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Ürünler
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/products/import">
            <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">CSV İçe Aktar</span>
            </Button>
          </Link>
          <Link href="/products/new">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Yeni Ürün</span>
            </Button>
          </Link>
        </div>
      </div>

      <ProductsTable products={products} />
    </div>
  )
}

