"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  status: string
  completedAt: Date | null
  createdAt: Date
  orderItems: Array<{
    id: string
    quantity: number
    product: {
      name: string
      sku: string
    }
  }>
}

export function CompletedOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=COMPLETED")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.filter((o: Order) => o.status === "COMPLETED"))
      }
    } catch (error) {
      console.error("Orders fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<ShoppingCart className="w-12 h-12 text-gray-300" />}
            title="Henüz tamamlanan üretim talebi bulunmuyor"
            description="Tamamlanan üretim talepleri burada görüntülenecek"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </h3>
              </div>
              <Badge className="bg-green-500">Tamamlandı</Badge>
            </div>

            <div className="space-y-2 mb-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-gray-500"> x {item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              {order.completedAt
                ? `Tamamlandı: ${format(new Date(order.completedAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}`
                : format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

