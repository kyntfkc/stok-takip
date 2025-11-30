"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

interface NewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewOrderModal({ open, onOpenChange }: NewOrderModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")

  useEffect(() => {
    if (open) {
      fetchProducts()
    }
  }, [open])

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
    setIsQuantityModalOpen(true)
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

    setIsQuantityModalOpen(false)
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

  const handleSubmit = async () => {
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
        // Formu temizle
        setItems([])
        setSearchTerm("")
        setSearchResults([])
        onOpenChange(false)
        router.refresh()
      } else {
        let errorMessage = "Üretim talebi oluşturulurken hata oluştu"
        try {
          const text = await response.text()
          console.error("Order creation error response (raw):", text)
          console.error("Response status:", response.status)
          console.error("Response headers:", Object.fromEntries(response.headers.entries()))
          
          if (text) {
            try {
              const error = JSON.parse(text)
              console.error("Order creation error response (parsed):", error)
              errorMessage = error.error || error.details || error.message || errorMessage
            } catch (parseError) {
              console.error("Failed to parse JSON:", parseError)
              errorMessage = text || errorMessage
            }
          } else {
            errorMessage = `Hata: ${response.status} ${response.statusText || "Unknown error"}`
          }
        } catch (readError) {
          console.error("Failed to read error response:", readError)
          errorMessage = `Hata: ${response.status} ${response.statusText || "Unknown error"}`
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Order creation fetch error:", error)
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setItems([])
    setSearchTerm("")
    setSearchResults([])
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Üretim Talebi</DialogTitle>
            <DialogDescription>
              Üretilmesi gereken ürünleri seçin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Arama */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Seçilen Ürünler ({items.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <Card key={item.productId} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{item.productName}</CardTitle>
                            <CardDescription className="mt-1 text-xs">SKU: {item.productSku}</CardDescription>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-700">Adet:</label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-7 w-7 p-0 text-xs"
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
                              className="w-16 text-center h-7 text-xs"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="h-7 w-7 p-0 text-xs"
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
                <CardContent className="text-center py-8">
                  <ShoppingCart className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Henüz ürün eklenmedi</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Üstteki arama çubuğunu kullanarak ürün ekleyin
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
            >
              {loading ? "Oluşturuluyor..." : "Üretim Talebi Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adet girişi modal */}
      <Dialog open={isQuantityModalOpen} onOpenChange={setIsQuantityModalOpen}>
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
                setIsQuantityModalOpen(false)
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
    </>
  )
}

