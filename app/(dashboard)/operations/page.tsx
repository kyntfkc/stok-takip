"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  Camera, 
  Check, 
  Plus, 
  Minus, 
  Package,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  qrCode: string | null
}

export default function OperationsPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [loading, setLoading] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<{ type: "IN" | "OUT"; quantity: number; productName: string } | null>(null)
  const scannerRef = useRef<any>(null)
  const qrCodeRegionId = "qr-reader"

  const loadProduct = async (sku: string) => {
    try {
      const productsRes = await fetch("/api/products")
      const products = await productsRes.json()
      const foundProduct = products.find((p: Product) => p.sku === sku)

      if (!foundProduct) {
        toast.error("Ürün bulunamadı")
        return
      }

      // Ürün detay sayfasına yönlendir
      router.push(`/products/${foundProduct.id}`)
    } catch (error) {
      toast.error("Ürün yüklenirken hata oluştu")
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  // Scanning state değiştiğinde taramayı başlat
  useEffect(() => {
    if (!scanning) return

    // Element'in render edilmesini bekle
    const timer = setTimeout(async () => {
      // Element'in varlığını kontrol et
      const element = document.getElementById(qrCodeRegionId)
      if (!element) {
        console.error("QR reader element not found")
        setScanning(false)
        return
      }

      try {
        // html5-qrcode kütüphanesini dynamic import ile yükle
        const { Html5Qrcode } = await import("html5-qrcode")
        const html5QrCode = new Html5Qrcode(qrCodeRegionId)
        scannerRef.current = html5QrCode

        // Mobil ve desktop için merkezi kutu
        const isMobile = window.innerWidth < 768
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: isMobile ? { width: 250, height: 250 } : { width: 300, height: 300 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            try {
              const data = JSON.parse(decodedText)
              if (data.type === "product" && data.sku) {
                await loadProduct(data.sku)
                stopScanning()
                toast.success("QR kod okundu")
              } else {
                toast.error("Geçersiz QR kod")
              }
            } catch {
              toast.error("QR kod formatı geçersiz")
            }
          },
          () => {}
        )
      } catch (error) {
        toast.error("Kamera başlatılamadı")
        console.error(error)
        setScanning(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [scanning])

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (error) {
        console.error(error)
      }
    }
    setScanning(false)
  }

  const handleTransaction = async (type: "IN" | "OUT") => {
    if (!product) {
      toast.error("Lütfen önce QR kod okuyun")
      return
    }

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 1) {
      toast.error("Geçerli bir miktar girin")
      return
    }

    if (type === "OUT" && product.currentStock < qty) {
      toast.error("Yetersiz stok")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/stock/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          type,
          quantity: qty,
          reason: type === "IN" ? "QR kod ile stok girişi" : "QR kod ile stok çıkışı",
        }),
      })

      if (response.ok) {
        const newStock = type === "IN" 
          ? product.currentStock + qty 
          : product.currentStock - qty
        
        setProduct({ ...product, currentStock: newStock })
        setLastTransaction({ type, quantity: qty, productName: product.name })
        setQuantity("1")
        toast.success(
          `Stok ${type === "IN" ? "girişi" : "çıkışı"} başarıyla yapıldı`
        )
      } else {
        const error = await response.json()
        toast.error(error.error || "İşlem sırasında hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const quickQuantity = (value: number) => {
    setQuantity(value.toString())
  }

  const reset = () => {
    setProduct(null)
    setQuantity("1")
    setLastTransaction(null)
  }

  return (
    <div className="-m-6 md:m-0">
      {/* Mobil için başlık gizle, desktop için göster */}
      <div className="hidden md:block mb-6 px-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Operasyonel İşlemler
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          QR kod okutarak hızlı stok işlemi yapın
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-0 md:px-0">

        {/* Son İşlem */}
        {lastTransaction && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg mx-4 md:mx-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lastTransaction.type === "IN" ? (
                    <div className="p-2 bg-green-500 rounded-full">
                      <ArrowUp className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-500 rounded-full">
                      <ArrowDown className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{lastTransaction.productName}</p>
                    <p className="text-sm text-gray-600">
                      {lastTransaction.type === "IN" ? "Giriş" : "Çıkış"}: {lastTransaction.quantity} adet
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLastTransaction(null)}
                  className="rounded-xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Kod Okutma */}
        {!product && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60 md:border md:shadow-lg md:bg-white/80 mx-0 md:mx-0">
            <CardHeader className="hidden md:block">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Kod Okut
              </CardTitle>
              <CardDescription>Ürün QR kodunu tarayın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0 md:p-6">
              {scanning && (
                <div className="space-y-4">
                  <div 
                    id={qrCodeRegionId} 
                    className="w-full rounded-lg overflow-hidden md:rounded-xl"
                    style={{ 
                      minHeight: "400px",
                      maxHeight: "500px"
                    }}
                  />
                  <Button 
                    onClick={stopScanning} 
                    variant="outline" 
                    className="w-full rounded-xl min-h-[56px] md:min-h-[50px] text-base md:text-base"
                  >
                    Taramayı Durdur
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ürün Bilgileri ve İşlemler */}
        {product && (
          <div className="space-y-4 px-4 md:px-0 pb-4 md:pb-0">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="mt-1">SKU: {product.sku}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="rounded-xl"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ürün QR Kodu */}
                {product.qrCode && (
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                      <Image
                        src={product.qrCode}
                        alt="QR Code"
                        width={120}
                        height={120}
                        className="w-[120px] h-[120px]"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {/* Stok Bilgisi */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Mevcut Stok</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {product.currentStock}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">adet</p>
                </div>

                {/* Miktar Seçimi */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Miktar
                  </label>
                  
                  {/* Hızlı Miktar Butonları */}
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 25].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant={quantity === val.toString() ? "default" : "outline"}
                        onClick={() => quickQuantity(val)}
                        className={`rounded-xl min-h-[56px] md:min-h-[50px] text-lg md:text-base ${
                          quantity === val.toString()
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : ""
                        }`}
                      >
                        {val}
                      </Button>
                    ))}
                  </div>

                  {/* Manuel Miktar Girişi */}
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Miktar girin"
                    className="text-center text-xl md:text-lg py-4 md:py-3 rounded-xl min-h-[56px] md:min-h-[48px]"
                  />
                </div>

                {/* İşlem Butonları */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Button
                    onClick={() => handleTransaction("IN")}
                    disabled={loading || !quantity || parseInt(quantity) < 1}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[80px] md:min-h-[70px] text-xl md:text-lg font-semibold touch-action-manipulation"
                  >
                    <Plus className="h-7 w-7 md:h-6 md:w-6 mr-2" />
                    Stok Ekle
                  </Button>
                  <Button
                    onClick={() => handleTransaction("OUT")}
                    disabled={loading || !quantity || parseInt(quantity) < 1 || product.currentStock < parseInt(quantity)}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[80px] md:min-h-[70px] text-xl md:text-lg font-semibold disabled:opacity-50 touch-action-manipulation"
                  >
                    <Minus className="h-7 w-7 md:h-6 md:w-6 mr-2" />
                    Stok Çıkar
                  </Button>
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>İşleniyor...</span>
                  </div>
                )}

                {/* Yeni QR Okut */}
                <Button
                  onClick={reset}
                  variant="outline"
                  className="w-full rounded-xl min-h-[56px] md:min-h-[50px] text-lg md:text-base touch-action-manipulation"
                >
                  <QrCode className="h-6 w-6 md:h-5 md:w-5 mr-2" />
                  Yeni QR Kod Okut
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

