"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, QrCode, Plus, Minus } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  weight: number | null
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Ürün Adı</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">SKU</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Ağırlık</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-700">Stok</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/products/${product.id}`}
                  >
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{product.sku}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {product.weight ? `${product.weight} g` : "-"}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-medium">{product.currentStock}</span>
                    </td>
                    <td className="p-3 text-center">
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
                            ? "bg-red-500"
                            : product.currentStock <= 10
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }
                      >
                        {product.currentStock === 0
                          ? "Tükendi"
                          : product.currentStock <= 10
                          ? "Düşük"
                          : "Normal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

