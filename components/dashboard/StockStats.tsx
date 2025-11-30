import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Warehouse, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface StockStatsProps {
  totalProducts: number
  totalStock: number
  lowStockCount: number
  todayIn: number
  todayOut: number
}

export function StockStats({
  totalProducts,
  totalStock,
  lowStockCount,
  todayIn,
  todayOut,
}: StockStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
          <Package className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-gray-500">Kayıtlı ürün sayısı</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
          <Warehouse className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStock.toLocaleString("tr-TR")}</div>
          <p className="text-xs text-gray-500">Toplam stok miktarı</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          <p className="text-xs text-gray-500">Kritik seviye altı</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bugün Giriş</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{todayIn}</div>
          <p className="text-xs text-gray-500">Günlük stok girişi</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bugün Çıkış</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{todayOut}</div>
          <p className="text-xs text-gray-500">Günlük stok çıkışı</p>
        </CardContent>
      </Card>
    </div>
  )
}

