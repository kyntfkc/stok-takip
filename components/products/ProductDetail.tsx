"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Package, Edit, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/utils"
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
import { QRCodeDisplay } from "@/components/products/QRCodeDisplay"

interface ProductDetailProps {
  product: {
    id: string
    name: string
    sku: string
    weight: number | null
    currentStock: number
    qrCode: string | null
    imageUrl: string | null
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
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stockLoading, setStockLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    weight: product.weight?.toString() || "",
    description: product.description || "",
    categoryId: product.categoryId || "",
  })
  const [stockFormData, setStockFormData] = useState({
    type: "IN" as "IN" | "OUT",
    quantity: "",
    reason: "",
  })
  const [isDesktopStockUpdateOpen, setIsDesktopStockUpdateOpen] = useState(false)

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

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setStockLoading(true)

    const qty = parseInt(stockFormData.quantity)
    if (isNaN(qty) || qty === 0) {
      toast.error("Geçerli bir miktar girin (0 dışında)")
      setStockLoading(false)
      return
    }

    // Pozitif/negatif sayıya göre işlem tipini belirle
    const transactionType = qty > 0 ? "IN" : "OUT"
    const absoluteQty = Math.abs(qty)

    // Çıkış işlemi için stok kontrolü
    if (transactionType === "OUT" && product.currentStock < absoluteQty) {
      toast.error("Yetersiz stok")
      setStockLoading(false)
      return
    }

    try {
      const response = await fetch("/api/stock/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          type: transactionType,
          quantity: absoluteQty,
          reason: stockFormData.reason || null,
        }),
      })

      if (response.ok) {
        toast.success(
          `Stok ${transactionType === "IN" ? "girişi" : "çıkışı"} başarıyla yapıldı`
        )
        setIsStockUpdateOpen(false)
        setIsDesktopStockUpdateOpen(false)
        setStockFormData({ type: "IN", quantity: "", reason: "" })
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "İşlem sırasında hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setStockLoading(false)
    }
  }

  const adjustQuantity = (delta: number) => {
    const current = parseInt(stockFormData.quantity) || 0
    const newValue = Math.max(1, current + delta)
    setStockFormData({ ...stockFormData, quantity: newValue.toString(), type: "OUT" })
  }

  const imageUrl = product.imageUrl || getProductImageUrl(product.name, product.sku)

  return (
    <div className="space-y-4">
      {/* Mobil Layout */}
      <div className="md:hidden space-y-4">
        {/* Ürün Görseli */}
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stok Güncelleme Butonu */}
        <Dialog open={isStockUpdateOpen} onOpenChange={(open) => {
          setIsStockUpdateOpen(open)
          if (open) {
            setStockFormData({ type: "OUT", quantity: "1", reason: "" })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full min-h-[80px] text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Package className="h-6 w-6 mr-2" />
              Stok Miktarını Güncelle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg flex flex-col p-6 max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)]">
            <DialogHeader className="pb-4 px-0 flex-shrink-0">
              <DialogTitle className="text-xl font-bold">Stok Çıkışı</DialogTitle>
              <DialogDescription className="text-base">
                Stok çıkışı yapın
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStockUpdate} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-6 py-4 flex-1 min-h-0">
                <div className="space-y-3">
                  <Label htmlFor="stock-quantity" className="text-base font-medium">Miktar</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="min-h-[60px] min-w-[60px] text-2xl font-bold border-2"
                      onClick={() => adjustQuantity(-1)}
                      disabled={parseInt(stockFormData.quantity) <= 1}
                    >
                      <Minus className="h-6 w-6" />
                    </Button>
                    <Input
                      id="stock-quantity"
                      type="number"
                      min="1"
                      max={product.currentStock}
                      value={stockFormData.quantity}
                      onChange={(e) =>
                        setStockFormData({ ...stockFormData, quantity: e.target.value, type: "OUT" })
                      }
                      required
                      placeholder="Miktar"
                      className="text-center text-2xl font-bold min-h-[60px] text-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="min-h-[60px] min-w-[60px] text-2xl font-bold border-2"
                      onClick={() => adjustQuantity(1)}
                      disabled={parseInt(stockFormData.quantity) >= product.currentStock}
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                  <p className="text-base text-gray-600 text-center">
                    Mevcut stok: <span className="font-bold text-gray-900">{product.currentStock} adet</span>
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col gap-3 sm:flex-row pt-4 border-t px-0 flex-shrink-0 pb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStockUpdateOpen(false)}
                  className="w-full sm:w-auto min-h-[60px] text-lg font-medium"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={stockLoading}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 min-h-[60px] text-lg font-semibold"
                >
                  {stockLoading ? "İşleniyor..." : "Stok Çıkışı"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Son 10 İşlem */}
        <Card>
          <CardHeader>
            <CardTitle>Son İşlemler</CardTitle>
            <CardDescription>Son 10 stok hareketi</CardDescription>
          </CardHeader>
          <CardContent>
            {product.stockTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-6 text-sm">
                Henüz stok hareketi bulunmuyor
              </p>
            ) : (
              <div className="space-y-2">
                {product.stockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
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
                        <span className="font-medium text-sm">
                          {transaction.quantity} adet
                        </span>
                      </div>
                      {transaction.reason && (
                        <p className="text-xs text-gray-600 mt-1">
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

      {/* Desktop Layout */}
      <div className="hidden md:block">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ürün Görseli - Sol Kolon */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden max-h-[500px]">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ürün Bilgileri - Sağ Kolon */}
        <div className="lg:col-span-1 space-y-4">
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
                <DialogContent className="sm:max-w-md">
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
                          className="mt-1"
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
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Ağırlık (1 adet, g)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                          value={formData.categoryId || "none"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, categoryId: value === "none" ? "" : value })
                          }
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Kategori yok</SelectItem>
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
                          className="mt-1"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Ürün Adı</label>
                <p className="text-sm font-semibold mt-1">{product.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">SKU</label>
                <p className="text-sm mt-1">{product.sku}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Ağırlık (1 adet)</label>
                <p className="text-sm mt-1">{product.weight ? `${product.weight} g` : "-"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Kategori</label>
                <p className="text-sm mt-1">
                  {product.category ? (
                    <Badge variant="outline">{product.category.name}</Badge>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
            </div>
            {product.description && (
              <div>
                <label className="text-xs font-medium text-gray-500">Açıklama</label>
                <p className="text-sm mt-1">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mevcut Stok ve Stok Durumu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="!p-0">
            <CardHeader className="!px-3 !pt-3 !pb-2">
              <CardTitle className="text-sm text-center">Mevcut Stok</CardTitle>
            </CardHeader>
            <CardContent className="!px-3 !pb-3 !pt-0">
              <p className="text-lg font-bold text-blue-600 text-center">
                {product.currentStock} adet
              </p>
            </CardContent>
          </Card>

          <Card className="!p-0">
            <CardHeader className="!px-3 !pt-3 !pb-2">
              <CardTitle className="text-sm text-center">Stok Durumu</CardTitle>
            </CardHeader>
            <CardContent className="!px-3 !pb-3 !pt-0">
              <div className="flex items-center justify-center">
                <Badge
                  variant={
                    product.currentStock === 0
                      ? "destructive"
                      : product.currentStock <= 10
                      ? "secondary"
                      : "default"
                  }
                  className={`text-xs px-3 py-1 ${
                    product.currentStock === 0
                      ? "bg-red-500"
                      : product.currentStock <= 10
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
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
        </div>

        {/* Stok Güncelleme ve QR Kod */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog 
            open={isDesktopStockUpdateOpen} 
            onOpenChange={(open) => {
              setIsDesktopStockUpdateOpen(open)
              if (open) {
                setStockFormData({ type: "IN", quantity: "", reason: "" })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Package className="h-4 w-4 mr-2" />
                Stok Güncelle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Stok Güncelle</DialogTitle>
                <DialogDescription>
                  Pozitif sayı stok ekler, negatif sayı stok azaltır
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleStockUpdate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-blue-600 mb-1">Mevcut Stok</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {product.currentStock} adet
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desktop-stock-quantity">Miktar</Label>
                      <Input
                        id="desktop-stock-quantity"
                        type="number"
                        step="1"
                        value={stockFormData.quantity}
                        onChange={(e) =>
                          setStockFormData({ ...stockFormData, quantity: e.target.value })
                        }
                        required
                        placeholder="Örn: +10 (ekle) veya -5 (azalt)"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDesktopStockUpdateOpen(false)
                      setStockFormData({ type: "IN", quantity: "", reason: "" })
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={stockLoading}
                    className={
                      stockFormData.quantity && parseInt(stockFormData.quantity) >= 0
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {stockLoading ? "İşleniyor..." : "Güncelle"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {product.qrCode && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 sm:w-auto">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Kod Detayı
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>QR Kod</DialogTitle>
                  <DialogDescription>{product.name}</DialogDescription>
                </DialogHeader>
                <QRCodeDisplay 
                  product={{
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    qrCode: product.qrCode,
                    imageUrl: imageUrl,
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        </div>
      </div>

      {/* Stok Hareket Geçmişi - Geniş Kart */}
      <Card>
        <CardHeader>
          <CardTitle>Stok Hareket Geçmişi</CardTitle>
          <CardDescription>Son 10 işlem</CardDescription>
        </CardHeader>
        <CardContent>
          {product.stockTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              Henüz stok hareketi bulunmuyor
            </p>
          ) : (
            <div className="space-y-2">
              {product.stockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
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
                      <span className="font-medium text-sm">
                        {transaction.quantity} adet
                      </span>
                    </div>
                    {transaction.reason && (
                      <p className="text-xs text-gray-600 mt-1">
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
    </div>
  )
}

