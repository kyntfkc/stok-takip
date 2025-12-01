import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const ProductsTable = dynamic(() => import("@/components/products/ProductsTable").then(mod => ({ default: mod.ProductsTable })), {
  loading: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    </div>
  ),
})

export default async function ProductsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      sku: true,
      weight: true,
      currentStock: true,
      qrCode: true,
      imageUrl: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Ürünler
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ürünleri görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/import">
            <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-md shadow-sm hover:shadow transition-all duration-200 min-h-[32px] px-2 text-xs">
              <Upload className="h-3 w-3 mr-1.5" />
              <span className="hidden sm:inline">CSV İçe Aktar</span>
            </Button>
          </Link>
          <Link href="/products/new">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-md shadow-sm hover:shadow transition-all duration-200 min-h-[32px] px-2 text-xs">
              <Plus className="h-3 w-3 mr-1.5" />
              <span className="hidden sm:inline">Yeni Ürün</span>
            </Button>
          </Link>
        </div>
      </div>

      <ProductsTable products={products} />
    </>
  )
}

