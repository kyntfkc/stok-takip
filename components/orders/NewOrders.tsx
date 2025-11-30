"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { NewOrderModal } from "./NewOrderModal"

interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  status: string
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

export function NewOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=NEW")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.filter((o: Order) => o.status === "NEW"))
      }
    } catch (error) {
      console.error("Orders fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Üretim Talebi
        </Button>
      </div>

      <NewOrderModal open={isModalOpen} onOpenChange={setIsModalOpen} />

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Henüz yeni üretim talebi bulunmuyor</p>
            <Button className="mt-4" variant="outline" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Üretim Talebini Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
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
                  <Badge>Yeni</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium">{item.product.name}</span>
                      <span className="text-gray-500"> x {item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}
                </div>

                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" className="w-full">
                    Detaylar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

