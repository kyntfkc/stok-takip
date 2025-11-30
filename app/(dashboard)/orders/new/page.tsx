"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Search, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  sku: string
  category?: {
    name: string
  } | null
}

interface OrderItem {
  productId: string
  productName: string
  productSku: string
  quantity: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          credentials: "include",
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.error("Products API error:", error)
          toast.error(error.error || "Ürünler yüklenirken hata oluştu")
          return
        }
        
        const data = await response.json()
        console.log("Products loaded:", data.length)
        
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error("Products is not an array:", data)
          toast.error("Ürünler yüklenirken hata oluştu")
        }
      } catch (error) {
        console.error("Products fetch error:", error)
        toast.error("Ürünler yüklenirken hata oluştu")
      }
    }
    
    fetchProducts()
  }, [])

  // Arama fonksiyonu
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      return
    }

    if (products.length === 0) {
      console.log("No products available for search")
      setSearchResults([])
      return
    }

    const filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    console.log("Search term:", searchTerm, "Results:", filtered.length)
    setSearchResults(filtered.slice(0, 10)) // İlk 10 sonuç
  }, [searchTerm, products])

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setQuantity("1")
    setIsModalOpen(true)
    setSearchTerm("")
    setSearchResults([])
  }

  const handleAddItem = () => {
    if (!selectedProduct) return

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 1) {
      toast.error("Geçerli bir miktar girin")
      return
    }

    // Aynı ürün zaten eklenmişse miktarı artır
    const existingIndex = items.findIndex(
      (item) => item.productId === selectedProduct.id
    )

    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].quantity += qty
      setItems(newItems)
      toast.success(`${selectedProduct.name} miktarı güncellendi`)
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productSku: selectedProduct.sku,
          quantity: qty,
        },
      ])
      toast.success(`${selectedProduct.name} eklendi`)
    }

    setIsModalOpen(false)
    setSelectedProduct(null)
    setQuantity("1")
  }

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error("En az bir ürün eklemelisiniz")
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }
      
      console.log("Submitting order:", requestBody)

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast.success("Üretim talebi başarıyla oluşturuldu")
        router.push("/orders")
      } else {
        const error = await response.json()
        console.error("Order creation error response:", error)
        toast.error(error.error || error.details || "Üretim talebi oluşturulurken hata oluştu")
      }
    } catch (error) {
      console.error("Order creation fetch error:", error)
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Yeni Üretim Talebi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Üretilmesi gereken ürünleri seçin
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ürün Ara
          </CardTitle>
          <CardDescription>
            Ürün adı veya SKU ile arama yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ürün adı veya SKU ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />

            {/* Arama sonuçları */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      </div>
                      {product.category && (
                        <Badge variant="outline">{product.category.name}</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ürün kartları */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Seçilen Ürünler ({items.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.productId} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.productName}</CardTitle>
                      <CardDescription className="mt-1">SKU: {item.productSku}</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Adet:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          updateQuantity(item.productId, val)
                        }}
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ürün yoksa mesaj */}
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz ürün eklenmedi</p>
            <p className="text-sm text-gray-400 mt-2">
              Üstteki arama çubuğunu kullanarak ürün ekleyin
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal - Adet girişi */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              SKU: {selectedProduct?.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Adet</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Adet"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setSelectedProduct(null)
                setQuantity("1")
              }}
            >
              İptal
            </Button>
            <Button type="button" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alt butonlar */}
      {items.length > 0 && (
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? "Oluşturuluyor..." : "Üretim Talebi Oluştur"}
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
