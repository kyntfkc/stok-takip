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
import { Html5Qrcode } from "html5-qrcode"
import Image from "next/image"

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  qrCode: string | null
}

export default function OperationsPage() {
  const [scanning, setScanning] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [loading, setLoading] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<{ type: "IN" | "OUT"; quantity: number; productName: string } | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
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

      setProduct(foundProduct)
      setQuantity("1")
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
        const html5QrCode = new Html5Qrcode(qrCodeRegionId)
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 300, height: 300 },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Başlık */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Operasyonel İşlemler
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            QR kod okutarak hızlı stok işlemi yapın
          </p>
        </div>

        {/* Son İşlem */}
        {lastTransaction && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
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
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Kod Okut
              </CardTitle>
              <CardDescription>Ürün QR kodunu tarayın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!scanning && (
                <Button 
                  onClick={() => setScanning(true)} 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[60px] text-lg"
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Kamerayı Başlat
                </Button>
              )}

              {scanning && (
                <div className="space-y-4">
                  <div 
                    id={qrCodeRegionId} 
                    className="w-full rounded-lg overflow-hidden"
                    style={{ minHeight: "300px" }}
                  />
                  <Button 
                    onClick={stopScanning} 
                    variant="outline" 
                    className="w-full rounded-xl min-h-[50px] text-base"
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
          <div className="space-y-4">
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
                        className={`rounded-xl min-h-[50px] ${
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
                    className="text-center text-lg py-3 rounded-xl"
                  />
                </div>

                {/* İşlem Butonları */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleTransaction("IN")}
                    disabled={loading || !quantity || parseInt(quantity) < 1}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[70px] text-lg font-semibold"
                  >
                    <Plus className="h-6 w-6 mr-2" />
                    Stok Ekle
                  </Button>
                  <Button
                    onClick={() => handleTransaction("OUT")}
                    disabled={loading || !quantity || parseInt(quantity) < 1 || product.currentStock < parseInt(quantity)}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[70px] text-lg font-semibold disabled:opacity-50"
                  >
                    <Minus className="h-6 w-6 mr-2" />
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
                  className="w-full rounded-xl min-h-[50px] text-base"
                >
                  <QrCode className="h-5 w-5 mr-2" />
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

