import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
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
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Düşük stoklu ürün bulunmuyor</p>
          </div>
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
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={product.currentStock === 0 ? "destructive" : "secondary"}
                >
                  {product.currentStock} adet
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Tüm Ürünleri Görüntüle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

