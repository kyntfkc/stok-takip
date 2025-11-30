import { getServerSession } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { QRCodeDisplay } from "@/components/products/QRCodeDisplay"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ProductQRPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    notFound()
  }

  if (!product.qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/products/${product.id}`}>
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">QR Kod</h1>
            <p className="mt-2 text-sm text-gray-600">Ürün QR kodu</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Bu ürün için QR kod bulunmuyor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/products/${product.id}`}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">QR Kod</h1>
          <p className="mt-2 text-sm text-gray-600">{product.name}</p>
        </div>
      </div>

      <QRCodeDisplay product={product} />
    </div>
  )
}

