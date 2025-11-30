"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
type ProductionStage = "TO_PRODUCE" | "WAX_PRESSING" | "WAX_READY" | "CASTING" | "BENCH" | "POLISHING" | "PACKAGING" | "COMPLETED"

const stageLabels: Record<ProductionStage, string> = {
  TO_PRODUCE: "Üretilecek",
  WAX_PRESSING: "Mum Basılıyor",
  WAX_READY: "Mumu Hazır",
  CASTING: "Dökümde",
  BENCH: "Tezgah",
  POLISHING: "Cila",
  PACKAGING: "Paketleme",
  COMPLETED: "Tamamlandı",
}

interface OrderDetailProps {
  order: {
    id: string
    orderNumber: string
    customerName: string | null
    status: string
    createdAt: Date
    completedAt: Date | null
    user: {
      name: string | null
      email: string
    } | null
    orderItems: Array<{
      id: string
      quantity: number
      status: ProductionStage
      product: {
        name: string
        sku: string
      }
      productionStages: Array<{
        id: string
        stage: ProductionStage
        createdAt: Date
      }>
    }>
  }
}

export function OrderDetail({ order }: OrderDetailProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge>Yeni</Badge>
      case "IN_PRODUCTION":
        return <Badge className="bg-blue-500">Üretimde</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Tamamlandı</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">İptal Edildi</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Üretim Talebi Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</label>
              <p className="text-lg font-semibold">
                {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", {
                  locale: tr,
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Durum</label>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</label>
              <p className="text-lg">
                {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", {
                  locale: tr,
                })}
              </p>
            </div>
            {order.completedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Tamamlanma Tarihi</label>
                <p className="text-lg">
                  {format(new Date(order.completedAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}
                </p>
              </div>
            )}
            {order.user && (
              <div>
                <label className="text-sm font-medium text-gray-500">Oluşturan</label>
                <p className="text-lg">{order.user.name || order.user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2">
                        {stageLabels[item.status]}
                      </Badge>
                      <p className="text-sm font-medium">{item.quantity} adet</p>
                    </div>
                  </div>

                  {item.productionStages.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Üretim Geçmişi:
                      </p>
                      <div className="space-y-1">
                        {item.productionStages.slice(0, 5).map((stage) => (
                          <div
                            key={stage.id}
                            className="text-xs text-gray-600 flex items-center justify-between"
                          >
                            <span>{stageLabels[stage.stage]}</span>
                            <span>
                              {format(new Date(stage.createdAt), "dd MMM, HH:mm", {
                                locale: tr,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Özet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Kalem</span>
                <span className="font-semibold">{order.orderItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Miktar</span>
                <span className="font-semibold">
                  {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} adet
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

