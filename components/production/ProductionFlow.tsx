"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  Sparkles,
  Wrench,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  CheckSquare,
  Square,
  Printer,
  FileText,
  Edit,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductionStage } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/utils"

const stageLabels: Record<ProductionStage, string> = {
  TO_PRODUCE: "Üretilecek",
  WAX_PRESSING: "Mum Basılıyor",
  WAX_READY: "Mumu Hazır",
  CASTING: "Dökümde",
  BENCH: "Tezgah",
  POLISHING: "Cila",
  PACKAGING: "Paketleme",
  COMPLETED: "Tamamlandı",
}

const stageIcons: Record<ProductionStage, typeof Package> = {
  TO_PRODUCE: Package,
  WAX_PRESSING: Package,
  WAX_READY: Sparkles,
  CASTING: Sparkles,
  BENCH: Wrench,
  POLISHING: Wrench,
  PACKAGING: Package,
  COMPLETED: CheckCircle2,
}

const allStages: ProductionStage[] = [
  "TO_PRODUCE",
  "WAX_PRESSING",
  "WAX_READY",
  "CASTING",
  "BENCH",
  "POLISHING",
  "PACKAGING",
  "COMPLETED",
]

interface OrderItem {
  id: string
  quantity: number
  status: ProductionStage
  note: string | null
  updatedAt: Date
  product: {
    name: string
    sku: string
    imageUrl: string | null
  }
  order: {
    orderNumber: string
    customerName: string | null
  }
}

interface ProductionFlowProps {
  orderItems: OrderItem[]
}

export function ProductionFlow({ orderItems: initialOrderItems }: ProductionFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderItems, setOrderItems] = useState(initialOrderItems)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<ProductionStage>(
    (searchParams.get("stage") as ProductionStage) || "TO_PRODUCE"
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "product">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null)
  const [noteText, setNoteText] = useState("")

  // URL parametresini güncelle
  useEffect(() => {
    const currentStage = searchParams.get("stage")
    if (currentStage !== statusFilter) {
      const params = new URLSearchParams()
      params.set("stage", statusFilter)
      router.replace(`/orders/production?${params.toString()}`, { scroll: false })
    }
  }, [statusFilter, router, searchParams])

  // Filtreleme ve Sıralama
  const filteredItems = useMemo(() => {
    let filtered = orderItems

    // Durum filtresi - sadece seçili duruma göre filtrele
    filtered = filtered.filter((item) => item.status === statusFilter)

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.product.name.toLowerCase().includes(query) ||
          item.product.sku.toLowerCase().includes(query) ||
          item.order.orderNumber.toLowerCase().includes(query) ||
          (item.order.customerName?.toLowerCase().includes(query) ?? false)
      )
    }

    // Sıralama
    filtered = [...filtered].sort((a, b) => {
      let result = 0
      if (sortBy === "date") {
        result = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else {
        // Ürün adına göre sıralama
        result = a.product.name.localeCompare(b.product.name, "tr")
      }
      // Sıralama yönünü uygula
      return sortOrder === "desc" ? result : -result
    })

    return filtered
  }, [orderItems, statusFilter, searchQuery, sortBy, sortOrder])

  const getNextStage = (currentStage: ProductionStage): ProductionStage | null => {
    const currentIndex = allStages.findIndex((s) => s === currentStage)
    if (currentIndex < allStages.length - 1) {
      return allStages[currentIndex + 1]
    }
    return null
  }

  const updateStage = async (itemId: string, newStage: ProductionStage) => {
    setLoading(itemId)
    try {
      const response = await fetch(`/api/orders/items/${itemId}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ stage: newStage }),
      })

      if (response.ok) {
        const updated = await response.json()
        setOrderItems((items) =>
          items.map((item) => (item.id === itemId ? updated : item))
        )
        toast.success("Aşama güncellendi")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Aşama güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(null)
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)))
    }
  }

  const handleBulkMove = async (stage: ProductionStage) => {
    if (selectedItems.size === 0) {
      toast.error("Lütfen en az bir ürün seçin")
      return
    }

    setBulkLoading(true)
    try {
      const response = await fetch("/api/orders/items/bulk-stage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemIds: Array.from(selectedItems),
          stage,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setOrderItems((items) =>
          items.map((item) => {
            const updated = result.items.find((i: OrderItem) => i.id === item.id)
            return updated || item
          })
        )
        toast.success(`${result.updated} ürün başarıyla taşındı`)
        setSelectedItems(new Set())
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Toplu taşıma sırasında hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setBulkLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleOpenNoteDialog = (item: OrderItem) => {
    setEditingItem(item)
    setNoteText(item.note || "")
    setNoteDialogOpen(true)
  }

  const handleSaveNote = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/orders/items/${editingItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ note: noteText }),
      })

      if (response.ok) {
        const updated = await response.json()
        setOrderItems((items) =>
          items.map((item) => (item.id === editingItem.id ? updated : item))
        )
        toast.success("Not güncellendi")
        setNoteDialogOpen(false)
        setEditingItem(null)
        setNoteText("")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Not güncellenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadgeClass = (status: ProductionStage) => {
    switch (status) {
      case "TO_PRODUCE":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "WAX_PRESSING":
      case "WAX_READY":
      case "CASTING":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "BENCH":
      case "POLISHING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "PACKAGING":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const allSelected = selectedItems.size === filteredItems.length && filteredItems.length > 0

  return (
    <div className="print-content">
      {/* Başlık Bölümü */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 print:hidden">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Üretim
          </h2>
          <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 px-3 py-1.5 rounded-lg text-sm">
            <Package className="w-4 h-4 mr-1.5" />
            {filteredItems.length} sipariş
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4 text-sm print:hidden"
          >
            <Printer className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Yazdır</span>
          </Button>
          <Button
            onClick={() => toast.info("Excel indirme özelliği yakında eklenecek")}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4 text-sm print:hidden"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Excel İndir</span>
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4 text-sm print:hidden"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-2">Yenile</span>
          </Button>
        </div>
      </div>

      {/* Durum Filtre Butonları */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 p-3 mb-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {allStages.map((stage) => {
            const Icon = stageIcons[stage]
            return (
              <Button
                key={stage}
                onClick={() => setStatusFilter(stage)}
                className={`rounded-xl px-4 py-2 text-sm md:text-base transition-all duration-200 min-h-[44px] ${
                  statusFilter === stage
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-700 border-2 border-slate-200 hover:bg-slate-200 active:scale-95"
                }`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {stageLabels[stage]}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Arama ve Sıralama */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 p-4 mb-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Arama Barı */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ürün adı, SKU veya sipariş numarası ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sıralama Butonları */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (sortBy === "date") {
                  // Aynı butona tekrar tıklandı, sıralama yönünü tersine çevir
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                } else {
                  // Farklı butona tıklandı, yeni sıralamaya geç ve varsayılan yönü ayarla
                  setSortBy("date")
                  setSortOrder("desc")
                }
              }}
              className={`min-h-[44px] px-4 text-sm transition-all ${
                sortBy === "date"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Tarih {sortBy === "date" && (sortOrder === "desc" ? " ↓" : " ↑")}
            </Button>
            <Button
              onClick={() => {
                if (sortBy === "product") {
                  // Aynı butona tekrar tıklandı, sıralama yönünü tersine çevir
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                } else {
                  // Farklı butona tıklandı, yeni sıralamaya geç ve varsayılan yönü ayarla
                  setSortBy("product")
                  setSortOrder("desc")
                }
              }}
              className={`min-h-[44px] px-4 text-sm transition-all ${
                sortBy === "product"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Ürün {sortBy === "product" && (sortOrder === "desc" ? " ↓" : " ↑")}
            </Button>
          </div>
        </div>
      </div>

      {/* Toplu İşlem Barı */}
      {selectedItems.size > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg p-5 mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-slate-800 font-semibold text-lg">
              {selectedItems.size} sipariş seçildi
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleBulkMove("CASTING")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[56px] px-6 text-base active:scale-95"
              >
                Döküme Gönder
              </Button>
              <Button
                onClick={() => handleBulkMove("CASTING")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[56px] px-6 text-base active:scale-95"
              >
                Dökümde
              </Button>
              <Button
                onClick={() => handleBulkMove("BENCH")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[56px] px-6 text-base active:scale-95"
              >
                Atölye
              </Button>
              <Button
                onClick={() => handleBulkMove("COMPLETED")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[56px] px-6 text-base active:scale-95"
              >
                Ürün Hazır
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tablo Görünümü (Desktop) */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Tablo Başlığı */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200/60 px-6 py-4 hidden md:grid md:grid-cols-[60px_1fr_140px_140px_1fr_200px] gap-6 items-center print:grid print:grid-cols-[1fr_100px_1fr] print:px-2 print:py-1 print:gap-2">
          <div className="flex items-center print:hidden">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className="w-6 h-6"
            />
          </div>
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 print:text-xs print:gap-1">
            <Package className="w-5 h-5 print:w-3 print:h-3" />
            Ürün Bilgisi
          </div>
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 print:text-xs print:gap-1 print:hidden">
            <Sparkles className="w-5 h-5 print:w-3 print:h-3" />
            Durum
          </div>
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 print:text-xs print:gap-1">
            <Package className="w-5 h-5 print:w-3 print:h-3" />
            Miktar
          </div>
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 print:text-xs print:gap-1">
            <FileText className="w-5 h-5 print:w-3 print:h-3" />
            Not
          </div>
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 print:hidden">
            İşlemler
          </div>
        </div>

        {/* Tablo İçeriği */}
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 p-12 text-center">
              <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-lg">Ürün bulunamadı</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItems.has(item.id)
              const nextStage = getNextStage(item.status)

              return (
                <div
                  key={item.id}
                  className={`px-6 py-5 grid md:grid-cols-[60px_1fr_140px_140px_1fr_200px] print:grid print:grid-cols-[1fr_100px_1fr] print:px-2 print:py-1 gap-6 print:gap-2 items-center transition-colors duration-200 ${
                    isSelected ? "bg-blue-50/70" : "bg-white hover:bg-slate-50/50"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center print:hidden">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectItem(item.id)}
                      className="w-6 h-6"
                    />
                  </div>

                  {/* Ürün Bilgisi */}
                  <div className="flex-1 min-w-0 flex items-center gap-4 print:gap-2">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-slate-200 print:w-12 print:h-12 print:border">
                      <Image
                        src={item.product.imageUrl || getProductImageUrl(item.product.name, item.product.sku)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={(item.product.imageUrl || getProductImageUrl(item.product.name, item.product.sku)).includes('unsplash.com') || (item.product.imageUrl || getProductImageUrl(item.product.name, item.product.sku)).includes('via.placeholder.com')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-lg print:text-xs">
                        {item.product.name}
                      </p>
                      <p className="text-base text-slate-600 truncate print:text-xs">
                        SKU: {item.product.sku}
                      </p>
                    </div>
                  </div>

                  {/* Durum */}
                  <div className="print:hidden">
                    <Badge
                      className={`${getStatusBadgeClass(item.status)} px-4 py-2.5 rounded-lg border-2 shadow-sm text-sm font-semibold print:px-2 print:py-1 print:text-xs print:border`}
                    >
                      {stageLabels[item.status]}
                    </Badge>
                  </div>

                  {/* Miktar */}
                  <div>
                    <Badge variant="outline" className="px-4 py-2.5 text-sm font-medium print:px-2 print:py-1 print:text-xs">
                      {item.quantity} adet
                    </Badge>
                  </div>

                  {/* Not */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      {item.note ? (
                        <p className="text-sm text-slate-700 truncate print:text-xs" title={item.note}>
                          {item.note}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 print:text-xs">Not yok</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleOpenNoteDialog(item)}
                      variant="ghost"
                      size="sm"
                      className="print:hidden min-h-[36px] min-w-[36px] p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* İşlemler */}
                  <div className="flex items-center justify-end print:hidden">
                    {nextStage && (
                      <Button
                        onClick={() => updateStage(item.id, nextStage)}
                        disabled={loading === item.id}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[56px] w-full max-w-[180px] active:scale-95 px-4"
                      >
                        <span className="text-base font-semibold">{stageLabels[nextStage]}</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Mobil Kart Görünümü */}
      <div className="md:hidden print:hidden space-y-4 mt-4">
        {filteredItems.map((item) => {
          const isSelected = selectedItems.has(item.id)
          const nextStage = getNextStage(item.status)
          const imageUrl = item.product.imageUrl || getProductImageUrl(item.product.name, item.product.sku)

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden ${
                isSelected ? "border-blue-400 ring-4 ring-blue-200" : "border-slate-200/60"
              }`}
            >
              {/* Ürün Görseli */}
              <div className="relative aspect-video bg-gradient-to-br from-slate-50 to-slate-100">
                <Image
                  src={imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
                />
                <div className="absolute top-3 left-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    className="bg-white/90 backdrop-blur-sm w-7 h-7"
                  />
                </div>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <p className="font-semibold text-slate-800 mb-2 text-xl">
                    {item.product.name}
                  </p>
                  <p className="text-base text-slate-600 mb-3">
                    SKU: {item.product.sku}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge
                      className={`${getStatusBadgeClass(item.status)} px-4 py-2 rounded-lg border-2 shadow-sm text-sm font-semibold`}
                    >
                      {stageLabels[item.status]}
                    </Badge>
                    <Badge variant="outline" className="text-sm font-medium px-4 py-2">
                      {item.quantity} adet
                    </Badge>
                  </div>
                </div>
                {nextStage && (
                  <Button
                    onClick={() => updateStage(item.id, nextStage)}
                    disabled={loading === item.id}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[56px] text-base font-semibold active:scale-95"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {stageLabels[nextStage]}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Not Düzenleme Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Not Ekle/Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Not</Label>
              <textarea
                id="note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base resize-none"
                placeholder="Notunuzu buraya yazın..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNoteDialogOpen(false)
                setEditingItem(null)
                setNoteText("")
              }}
            >
              İptal
            </Button>
            <Button onClick={handleSaveNote}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
