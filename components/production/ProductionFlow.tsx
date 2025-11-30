"use client"

import { useState, useMemo } from "react"
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
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ProductionStage } from "@prisma/client"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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

type StatusFilter = "ALL" | "TO_PRODUCE" | "CASTING" | "BENCH" | "COMPLETED"

interface OrderItem {
  id: string
  quantity: number
  status: ProductionStage
  product: {
    name: string
    sku: string
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
  const [orderItems, setOrderItems] = useState(initialOrderItems)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Filtreleme
  const filteredItems = useMemo(() => {
    let filtered = orderItems

    // Durum filtresi
    if (statusFilter !== "ALL") {
      if (statusFilter === "CASTING") {
        filtered = filtered.filter(
          (item) => item.status === "WAX_PRESSING" || item.status === "WAX_READY" || item.status === "CASTING"
        )
      } else if (statusFilter === "BENCH") {
        filtered = filtered.filter(
          (item) => item.status === "BENCH" || item.status === "POLISHING"
        )
      } else {
        filtered = filtered.filter((item) => item.status === statusFilter)
      }
    }

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

    return filtered
  }, [orderItems, statusFilter, searchQuery])

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
  const activeFiltersCount = (statusFilter !== "ALL" ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      {/* Başlık Bölümü */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Üretim
          </h2>
          <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 px-3 py-1.5 rounded-lg">
            <Package className="w-3 h-3 mr-1.5" />
            {filteredItems.length} sipariş
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => toast.info("Excel indirme özelliği yakında eklenecek")}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Excel İndir</span>
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-2">Yenile</span>
          </Button>
        </div>
      </div>

      {/* Durum Filtre Butonları */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/60 p-2.5 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "ALL" as StatusFilter, label: "Tümü", icon: Package },
            { key: "TO_PRODUCE" as StatusFilter, label: "Döküme Gönderilecek", icon: Package },
            { key: "CASTING" as StatusFilter, label: "Dökümde", icon: Sparkles },
            { key: "BENCH" as StatusFilter, label: "Atölye", icon: Wrench },
            { key: "COMPLETED" as StatusFilter, label: "Tamamlandı", icon: CheckCircle2 },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-lg px-2.5 py-1.5 text-xs md:text-sm transition-all duration-200 ${
                statusFilter === key
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtre ve Sıralama Paneli */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/60 mb-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium text-slate-800">Filtre ve Sıralama</span>
                {activeFiltersCount > 0 && (
                  <Badge className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {filtersOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-slate-200/60 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ürün adı, SKU veya sipariş numarası ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              {(searchQuery || statusFilter !== "ALL") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("ALL")
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Toplu İşlem Barı */}
      {selectedItems.size > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-slate-800 font-medium">
              {selectedItems.size} sipariş seçildi
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => handleBulkMove("CASTING")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[44px]"
              >
                Döküme Gönder
              </Button>
              <Button
                onClick={() => handleBulkMove("CASTING")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[44px]"
              >
                Dökümde
              </Button>
              <Button
                onClick={() => handleBulkMove("BENCH")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[44px]"
              >
                Atölye
              </Button>
              <Button
                onClick={() => handleBulkMove("COMPLETED")}
                disabled={bulkLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 min-h-[44px]"
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
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200/60 px-4 py-3 hidden md:grid md:grid-cols-[40px_1fr_120px_120px_120px_100px] gap-4">
          <div className="flex items-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
          </div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ürün Bilgisi
          </div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Durum
          </div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4" />
            Miktar
          </div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Sipariş
          </div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            İşlemler
          </div>
        </div>

        {/* Tablo İçeriği */}
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 p-12 text-center">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Ürün bulunamadı</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItems.has(item.id)
              const nextStage = getNextStage(item.status)

              return (
                <div
                  key={item.id}
                  className={`px-4 py-4 grid md:grid-cols-[40px_1fr_120px_120px_120px_100px] gap-4 items-center transition-colors duration-200 ${
                    isSelected ? "bg-blue-50/70" : "bg-white hover:bg-slate-50/50"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectItem(item.id)}
                    />
                  </div>

                  {/* Ürün Bilgisi */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-slate-600 truncate">
                      SKU: {item.product.sku}
                    </p>
                  </div>

                  {/* Durum */}
                  <div>
                    <Badge
                      className={`${getStatusBadgeClass(item.status)} px-3 py-2 rounded-lg border-2 shadow-sm text-xs font-medium`}
                    >
                      {stageLabels[item.status]}
                    </Badge>
                  </div>

                  {/* Miktar */}
                  <div>
                    <Badge variant="outline" className="px-3 py-2">
                      {item.quantity} adet
                    </Badge>
                  </div>

                  {/* Sipariş */}
                  <div>
                    <p className="text-sm text-slate-600 truncate">
                      {item.order.orderNumber}
                    </p>
                  </div>

                  {/* İşlemler */}
                  <div className="flex items-center gap-2">
                    {nextStage && (
                      <Button
                        size="sm"
                        onClick={() => updateStage(item.id, nextStage)}
                        disabled={loading === item.id}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-h-[36px]"
                      >
                        <ArrowRight className="w-4 h-4" />
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
      <div className="md:hidden space-y-3 mt-4">
        {filteredItems.map((item) => {
          const isSelected = selectedItems.has(item.id)
          const nextStage = getNextStage(item.status)

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-lg border ${
                isSelected ? "border-blue-300" : "border-slate-200/60"
              } p-4`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleSelectItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-800 mb-1">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    SKU: {item.product.sku}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={`${getStatusBadgeClass(item.status)} px-3 py-2 rounded-lg border-2 shadow-sm text-xs`}
                    >
                      {stageLabels[item.status]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.quantity} adet
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {item.order.orderNumber}
                  </p>
                </div>
              </div>
              {nextStage && (
                <Button
                  size="sm"
                  onClick={() => updateStage(item.id, nextStage)}
                  disabled={loading === item.id}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Sonraki Aşama
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
