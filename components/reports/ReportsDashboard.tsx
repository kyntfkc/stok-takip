"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Calendar, TrendingUp, Package } from "lucide-react"

interface TopProduct {
  productId: string
  _sum: {
    quantity: number | null
  }
  product: {
    name: string
    sku: string
  } | null
}

interface ReportsDashboardProps {
  dailyOrders: number
  weeklyOrders: number
  monthlyOrders: number
  topProducts: TopProduct[]
  dailyStats: Record<string, number>
}

export function ReportsDashboard({
  dailyOrders,
  weeklyOrders,
  monthlyOrders,
  topProducts,
  dailyStats,
}: ReportsDashboardProps) {
  const chartData = Object.entries(dailyStats)
    .map(([date, value]) => {
      const dateObj = new Date(date + "T00:00:00")
      return {
        date: dateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        üretim: value,
        sortDate: date,
      }
    })
    .sort((a, b) => a.sortDate.localeCompare(b.sortDate))
    .map(({ sortDate, ...rest }) => rest)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Üretim</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyOrders}</div>
            <p className="text-xs text-gray-500">Bugün tamamlanan sipariş</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Haftalık Üretim</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyOrders}</div>
            <p className="text-xs text-gray-500">Bu hafta tamamlanan sipariş</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Üretim</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyOrders}</div>
            <p className="text-xs text-gray-500">Bu ay tamamlanan sipariş</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Günlük Üretim Grafiği</CardTitle>
            <CardDescription>Son 30 günün üretim verileri</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="üretim" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Henüz veri bulunmuyor
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Üretilen Ürünler</CardTitle>
            <CardDescription>Toplam üretim miktarına göre</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((item, index) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {item.product?.name || "Bilinmeyen Ürün"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.product?.sku || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {item._sum.quantity || 0} adet
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Henüz üretim verisi bulunmuyor
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

