"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Package, Edit } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProductDetailProps {
  product: {
    id: string
    name: string
    sku: string
    weight: number | null
    currentStock: number
    qrCode: string | null
    description: string | null
    categoryId: string | null
    category: {
      id: string
      name: string
    } | null
    stockTransactions: Array<{
      id: string
      type: "IN" | "OUT"
      quantity: number
      reason: string | null
      createdAt: Date
      user: {
        name: string | null
        email: string
      } | null
    }>
  }
}

interface Category {
  id: string
  name: string
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    weight: product.weight?.toString() || "",
    description: product.description || "",
    categoryId: product.categoryId || "",
  })

  useEffect(() => {
    if (isEditOpen) {
      fetchCategories()
    }
  }, [isEditOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          description: formData.description || null,
          categoryId: formData.categoryId || null,
        }),
      })

      if (response.ok) {
        toast.success("Ürün başarıyla güncellendi")
        setIsEditOpen(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Ürün güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ürün Bilgileri</CardTitle>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ürünü Düzenle</DialogTitle>
                    <DialogDescription>
                      Ürün bilgilerini güncelleyin
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="name">Ürün Adı</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Ağırlık (g)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, categoryId: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Kategori yok</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Açıklama</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditOpen(false)}
                      >
                        İptal
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Kaydediliyor..." : "Kaydet"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Ürün Adı</label>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">SKU</label>
              <p className="text-lg">{product.sku}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ağırlık</label>
              <p className="text-lg">{product.weight ? `${product.weight} g` : "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kategori</label>
              <p className="text-lg">
                {product.category ? (
                  <Badge variant="outline">{product.category.name}</Badge>
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mevcut Stok</label>
              <p className="text-2xl font-bold">
                {product.currentStock} adet
              </p>
            </div>
            {product.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Açıklama</label>
                <p className="text-lg">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stok Hareket Geçmişi</CardTitle>
            <CardDescription>Son 20 işlem</CardDescription>
          </CardHeader>
          <CardContent>
            {product.stockTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Henüz stok hareketi bulunmuyor
              </p>
            ) : (
              <div className="space-y-3">
                {product.stockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={transaction.type === "IN" ? "default" : "secondary"}
                          className={
                            transaction.type === "IN"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {transaction.type === "IN" ? "Giriş" : "Çıkış"}
                        </Badge>
                        <span className="font-medium">
                          {transaction.quantity} adet
                        </span>
                      </div>
                      {transaction.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          {transaction.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", {
                          locale: tr,
                        })}
                        {transaction.user && ` • ${transaction.user.name || transaction.user.email}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stok Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Badge
                variant={
                  product.currentStock === 0
                    ? "destructive"
                    : product.currentStock <= 10
                    ? "secondary"
                    : "default"
                }
                className={
                  product.currentStock === 0
                    ? "bg-red-500 text-lg px-4 py-2"
                    : product.currentStock <= 10
                    ? "bg-orange-500 text-lg px-4 py-2"
                    : "bg-green-500 text-lg px-4 py-2"
                }
              >
                {product.currentStock === 0
                  ? "Tükendi"
                  : product.currentStock <= 10
                  ? "Düşük Stok"
                  : "Normal"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {product.qrCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Kod
              </CardTitle>
              <CardDescription>Ürün QR kodu</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border">
                <Image
                  src={product.qrCode}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="w-48 h-48"
                />
              </div>
              <Link href={`/products/${product.id}/qr`} className="mt-4">
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Kod Detayı
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

