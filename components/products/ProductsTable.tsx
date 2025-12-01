"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, QrCode, Eye, Download, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

interface Product {
  id: string
  name: string
  sku: string
  weight: number | null
  currentStock: number
  qrCode: string | null
  imageUrl: string | null
  category: {
    id: string
    name: string
  } | null
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleAllSelection = () => {
    const productsWithQR = filteredProducts
      .filter((p) => p.qrCode)
      .map((p) => p.id)
    
    if (productsWithQR.every((id) => selectedProducts.has(id))) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(productsWithQR))
    }
  }

  const createLabelElement = (product: Product): HTMLDivElement => {
    const div = document.createElement("div")
    div.style.width = "800px"
    div.style.minHeight = "300px"
    div.style.backgroundColor = "#ffffff"
    div.style.padding = "32px"
    div.style.borderRadius = "8px"
    div.style.border = "2px solid #e5e7eb"
    div.style.borderColor = "#e5e7eb"
    div.style.display = "flex"
    div.style.alignItems = "center"
    div.style.justifyContent = "space-between"
    div.style.gap = "40px"
    div.style.position = "absolute"
    div.style.left = "-9999px"
    div.style.top = "0"

    const leftDiv = document.createElement("div")
    leftDiv.style.flex = "1"
    leftDiv.style.display = "flex"
    leftDiv.style.flexDirection = "column"
    leftDiv.style.justifyContent = "center"
    leftDiv.style.backgroundColor = "#ffffff"

    const title = document.createElement("h2")
    title.textContent = product.name
    title.style.fontSize = "28px"
    title.style.fontWeight = "bold"
    title.style.color = "#111827"
    title.style.marginBottom = "12px"
    title.style.lineHeight = "1.2"
    title.style.backgroundColor = "transparent"

    const sku = document.createElement("p")
    sku.textContent = product.sku
    sku.style.fontSize = "20px"
    sku.style.color = "#374151"
    sku.style.fontWeight = "500"
    sku.style.backgroundColor = "transparent"

    leftDiv.appendChild(title)
    leftDiv.appendChild(sku)

    const rightDiv = document.createElement("div")
    rightDiv.style.flexShrink = "0"
    rightDiv.style.backgroundColor = "transparent"

    const img = document.createElement("img")
    img.src = product.qrCode!
    img.style.width = "200px"
    img.style.height = "200px"
    img.crossOrigin = "anonymous"

    rightDiv.appendChild(img)
    div.appendChild(leftDiv)
    div.appendChild(rightDiv)

    return div
  }

  const handleBulkDownload = async () => {
    const productsToDownload = filteredProducts.filter(
      (p) => selectedProducts.has(p.id) && p.qrCode
    )

    if (productsToDownload.length === 0) {
      alert("Lütfen en az bir ürün seçin")
      return
    }

    setIsDownloading(true)

    try {
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.left = "-9999px"
      container.style.top = "0"
      document.body.appendChild(container)

      for (const product of productsToDownload) {
        const labelElement = createLabelElement(product)
        container.appendChild(labelElement)

        // Kısa bir bekleme (resimlerin yüklenmesi ve layout için)
        await new Promise((resolve) => setTimeout(resolve, 100))

        // html-to-image kütüphanesini dynamic import ile yükle
        const { toJpeg } = await import("html-to-image")
        
        const dataUrl = await toJpeg(labelElement, {
          quality: 0.95,
          backgroundColor: "#ffffff",
          pixelRatio: 3,
        })

        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `${product.sku}-etiket.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        container.removeChild(labelElement)
      }

      document.body.removeChild(container)
      setSelectedProducts(new Set())
    } catch (error) {
      console.error("Toplu indirme hatası:", error)
      alert("Etiketler indirilirken bir hata oluştu")
    } finally {
      setIsDownloading(false)
    }
  }

  const productsWithQR = filteredProducts.filter((p) => p.qrCode)
  const allSelected = productsWithQR.length > 0 && productsWithQR.every((p) => selectedProducts.has(p.id))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Ürün adı veya SKU ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
            aria-label="Ürün ara"
          />
        </div>
        {productsWithQR.length > 0 && (
          <Button
            onClick={handleBulkDownload}
            disabled={isDownloading || selectedProducts.size === 0}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-md shadow-sm hover:shadow transition-all duration-200 min-h-[32px] px-2 text-xs"
          >
            <Download className="h-3 w-3 mr-1.5" />
            {isDownloading
              ? "İndiriliyor..."
              : `İndir (${selectedProducts.size})`}
          </Button>
        )}
      </div>

      {/* Kart Görünümü */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<ImageIcon className="w-12 h-12 text-gray-300" />}
              title={searchTerm ? "Arama sonucu bulunamadı" : "Henüz ürün eklenmemiş"}
              description={searchTerm ? "Farklı bir arama terimi deneyin" : "İlk ürününüzü ekleyerek başlayın"}
              action={
                !searchTerm
                  ? {
                      label: "Yeni Ürün Ekle",
                      onClick: () => window.location.href = "/products/new",
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          filteredProducts.map((product) => {
            const imageUrl = product.imageUrl || getProductImageUrl(product.name, product.sku)
            const isSelected = selectedProducts.has(product.id)
            
            return (
              <div
                key={product.id}
                className={`group bg-white rounded-md shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                  isSelected ? "border-blue-500 ring-1 ring-blue-200" : "border-slate-200"
                }`}
              >
                {/* Ürün Görseli */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                  {product.qrCode && (
                    <div className="absolute top-1 left-1 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                        className="bg-white/90 backdrop-blur-sm w-4 h-4"
                      />
                    </div>
                  )}
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
                  />
                  {/* Stok Durumu Badge */}
                  <div className="absolute top-1 right-1">
                    <Badge
                      className={`text-[10px] px-1 py-0 ${
                        product.currentStock === 0
                          ? "bg-red-500 text-white"
                          : product.currentStock <= 10
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {product.currentStock === 0
                        ? "Tükendi"
                        : product.currentStock <= 10
                        ? "Düşük"
                        : product.currentStock}
                    </Badge>
                  </div>
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-2 space-y-1">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">SKU: {product.sku}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    {product.category && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {product.category.name}
                      </Badge>
                    )}
                    {product.weight && (
                      <span className="text-slate-600 font-medium text-[10px]">
                        {product.weight}g
                      </span>
                    )}
                  </div>

                  {/* İşlem Butonları */}
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-6 text-[10px] px-1.5">
                        <Eye className="h-2.5 w-2.5 mr-0.5" />
                        Detay
                      </Button>
                    </Link>
                    {product.qrCode && (
                      <Link href={`/products/${product.id}/qr`}>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                          <QrCode className="h-2.5 w-2.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

