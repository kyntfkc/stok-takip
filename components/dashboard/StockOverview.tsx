"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, QrCode, Plus, Minus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/utils"

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  weight: number | null
  imageUrl: string | null
}

export function StockOverview() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setProducts(data)
        }
      }
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stok Özeti</CardTitle>
            <CardDescription>Tüm ürünlerin stok durumu</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/stock/qr-scanner">
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                QR Tarayıcı
              </Button>
            </Link>
            <Link href="/stock">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Stok İşlemleri
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ürün adı veya SKU ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "Arama sonucu bulunamadı" : "Henüz ürün eklenmemiş"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const imageUrl = product.imageUrl || getProductImageUrl(product.name, product.sku)
              return (
                <div
                  key={product.id}
                  onClick={() => window.location.href = `/products/${product.id}`}
                  className="group bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Ürün Görseli */}
                  <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
                    />
                    {/* Stok Durumu Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={
                          product.currentStock === 0
                            ? "bg-red-500 text-white"
                            : product.currentStock <= 10
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
                        }
                      >
                        {product.currentStock === 0
                          ? "Tükendi"
                          : product.currentStock <= 10
                          ? "Düşük"
                          : product.currentStock + " adet"}
                      </Badge>
                    </div>
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">SKU: {product.sku}</p>
                    {product.weight && (
                      <p className="text-sm text-slate-600 font-medium">
                        {product.weight} g
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

