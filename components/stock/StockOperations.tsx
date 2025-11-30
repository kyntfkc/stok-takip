"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Minus, QrCode } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function StockOperations() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    type: "IN" as "IN" | "OUT",
    quantity: "",
    reason: "",
  })
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string }>>([])

  // Ürünleri yükle
  useEffect(() => {
    fetch("/api/products", {
      credentials: "include", // Cookie'leri gönder
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(error.error || "Ürünler yüklenirken hata oluştu")
          })
        }
        return res.json()
      })
      .then((data) => {
        // API'den dönen verinin array olduğundan emin ol
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error("Products API returned non-array:", data)
          setProducts([])
          if (data?.error) {
            toast.error(data.error)
          } else {
            toast.error("Ürünler yüklenirken hata oluştu")
          }
        }
      })
      .catch((error) => {
        console.error("Products fetch error:", error)
        toast.error(error.message || "Ürünler yüklenirken hata oluştu")
        setProducts([])
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/stock/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
        }),
      })

      if (response.ok) {
        toast.success(
          `Stok ${formData.type === "IN" ? "girişi" : "çıkışı"} başarıyla yapıldı`
        )
        setFormData({
          productId: "",
          type: "IN",
          quantity: "",
          reason: "",
        })
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "İşlem sırasında hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stok İşlemi</CardTitle>
        <CardDescription>Manuel stok giriş veya çıkış yapın</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Ürün</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => setFormData({ ...formData, productId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ürün seçin" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    Ürün bulunamadı
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">İşlem Tipi</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "IN" | "OUT") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Giriş</SelectItem>
                <SelectItem value="OUT">Çıkış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Miktar</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              placeholder="Miktar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Sebep (Opsiyonel)</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="İşlem sebebi"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !formData.productId || !formData.quantity}
              className={
                formData.type === "IN"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {formData.type === "IN" ? (
                <Plus className="h-4 w-4 mr-2" />
              ) : (
                <Minus className="h-4 w-4 mr-2" />
              )}
              {loading
                ? "İşleniyor..."
                : formData.type === "IN"
                ? "Stok Girişi"
                : "Stok Çıkışı"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Link href="/stock/qr-scanner">
              <Button type="button" variant="outline" className="w-full">
                <QrCode className="h-4 w-4 mr-2" />
                QR Kod ile İşlem Yap
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

