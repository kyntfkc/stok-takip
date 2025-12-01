import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  imageUrl: string | null
}

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Düşük Stok Uyarıları</CardTitle>
          <CardDescription>Kritik seviyenin altındaki ürünler</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12 text-gray-300" />}
            title="Düşük stoklu ürün bulunmuyor"
            description="Tüm ürünleriniz kritik seviyenin üzerinde"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Düşük Stok Uyarıları
        </CardTitle>
        <CardDescription>Kritik seviyenin altındaki ürünler</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {products.map((product) => {
            const imageUrl = product.imageUrl || getProductImageUrl(product.name, product.sku)
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <Badge
                    variant={product.currentStock === 0 ? "destructive" : "secondary"}
                    className={
                      product.currentStock === 0
                        ? "bg-red-500 text-white"
                        : product.currentStock <= 5
                        ? "bg-orange-500 text-white"
                        : "bg-yellow-500 text-white"
                    }
                  >
                    {product.currentStock} adet
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link href="/products">
            <Button variant="outline" className="w-full" size="sm">
              Tüm Ürünleri Görüntüle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

