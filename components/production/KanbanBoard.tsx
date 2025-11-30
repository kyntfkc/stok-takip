"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type ProductionStage = "TO_PRODUCE" | "WAX_PRESSING" | "WAX_READY" | "CASTING" | "BENCH" | "POLISHING" | "PACKAGING" | "COMPLETED"

interface StageGroup {
  title: string
  stages: Array<{ key: ProductionStage; label: string }>
}

const stageGroups: StageGroup[] = [
  {
    title: "Üretilecek",
    stages: [
      { key: "TO_PRODUCE", label: "Üretilecek" },
    ],
  },
  {
    title: "Mum - Döküm",
    stages: [
      { key: "WAX_PRESSING", label: "Mum Basılıyor" },
      { key: "WAX_READY", label: "Mumu Hazır" },
      { key: "CASTING", label: "Dökümde" },
    ],
  },
  {
    title: "Atölye",
    stages: [
      { key: "BENCH", label: "Tezgah" },
      { key: "POLISHING", label: "Cila" },
    ],
  },
  {
    title: "Paketleme",
    stages: [
      { key: "PACKAGING", label: "Paketleme" },
    ],
  },
  {
    title: "Tamamlandı",
    stages: [
      { key: "COMPLETED", label: "Tamamlandı" },
    ],
  },
]

// Tüm aşamaları sıralı liste olarak
const allStages: ProductionStage[] = [
  "TO_PRODUCE",
  "WAX_PRESSING",
  "WAX_READY",
  "CASTING",
  "BENCH",
  "POLISHING",
  "PACKAGING",
  "COMPLETED",
]

interface OrderItem {
  id: string
  quantity: number
  status: ProductionStage
  product: {
    name: string
    sku: string
  }
  order: {
    orderNumber: string
    customerName: string | null
  }
}

interface KanbanBoardProps {
  orderItems: OrderItem[]
}

export function KanbanBoard({ orderItems: initialOrderItems }: KanbanBoardProps) {
  const router = useRouter()
  const [orderItems, setOrderItems] = useState(initialOrderItems)
  const [loading, setLoading] = useState<string | null>(null)

  const updateStage = async (itemId: string, newStage: ProductionStage) => {
    setLoading(itemId)
    try {
      const response = await fetch(`/api/orders/items/${itemId}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ stage: newStage }),
      })

      if (response.ok) {
        const updated = await response.json()
        setOrderItems((items) =>
          items.map((item) => (item.id === itemId ? updated : item))
        )
        toast.success("Aşama güncellendi")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Aşama güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(null)
    }
  }

  const getItemsForStage = (stage: ProductionStage) => {
    return orderItems.filter((item) => item.status === stage)
  }

  const getNextStage = (currentStage: ProductionStage): ProductionStage | null => {
    const currentIndex = allStages.findIndex((s) => s === currentStage)
    if (currentIndex < allStages.length - 1) {
      return allStages[currentIndex + 1]
    }
    return null
  }

  const getPrevStage = (currentStage: ProductionStage): ProductionStage | null => {
    const currentIndex = allStages.findIndex((s) => s === currentStage)
    if (currentIndex > 0) {
      return allStages[currentIndex - 1]
    }
    return null
  }

  return (
    <div className="space-y-6">
      {stageGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
            <div className="flex-1 h-px bg-gray-300"></div>
            <Badge variant="secondary" className="text-sm">
              {group.stages.reduce((sum, stage) => sum + getItemsForStage(stage.key).length, 0)} ürün
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {group.stages.map((stage) => {
                const items = getItemsForStage(stage.key)
                return (
                  <div key={stage.key} className="flex-shrink-0 w-80">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {stage.label}
                        <Badge variant="secondary" className="ml-2">
                          {items.length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-medium text-sm">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                                  <p className="text-xs text-gray-500">
                                    Sipariş: {item.order.orderNumber}
                                  </p>
                                  <Badge variant="outline" className="mt-2">
                                    {item.quantity} adet
                                  </Badge>
                                </div>

                                <div className="flex gap-2">
                                  {getPrevStage(item.status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateStage(item.id, getPrevStage(item.status)!)
                                      }
                                      disabled={loading === item.id}
                                      className="flex-1"
                                    >
                                      <ArrowLeft className="h-3 w-3 mr-1" />
                                      Geri
                                    </Button>
                                  )}
                                  {getNextStage(item.status) && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        updateStage(item.id, getNextStage(item.status)!)
                                      }
                                      disabled={loading === item.id}
                                      className="flex-1"
                                    >
                                      İleri
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                  {!getNextStage(item.status) && (
                                    <Button
                                      size="sm"
                                      onClick={() => updateStage(item.id, "COMPLETED")}
                                      disabled={loading === item.id}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                      Tamamla
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {items.length === 0 && (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            Boş
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
