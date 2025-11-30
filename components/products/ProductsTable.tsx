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
import { Search, QrCode, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toJpeg } from "html-to-image"

interface Product {
  id: string
  name: string
  sku: string
  weight: number | null
  currentStock: number
  qrCode: string | null
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Ürün adı veya SKU ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {productsWithQR.length > 0 && (
          <Button
            onClick={handleBulkDownload}
            disabled={isDownloading || selectedProducts.size === 0}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading
              ? "İndiriliyor..."
              : `Seçili Etiketleri İndir (${selectedProducts.size})`}
          </Button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                {productsWithQR.length > 0 && (
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAllSelection}
                  />
                )}
              </TableHead>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Ağırlık (g)</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="text-center">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? "Arama sonucu bulunamadı" : "Henüz ürün eklenmemiş"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.qrCode && (
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-600">{product.sku}</TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{product.weight ? `${product.weight} g` : "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {product.currentStock}
                  </TableCell>
                  <TableCell className="text-center">
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
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {product.qrCode && (
                        <Link href={`/products/${product.id}/qr`}>
                          <Button variant="ghost" size="sm">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

