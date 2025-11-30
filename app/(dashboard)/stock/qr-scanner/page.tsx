"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Camera, Check } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"

export default function QRScannerPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [quantity, setQuantity] = useState("")
  const [type, setType] = useState<"IN" | "OUT">("IN")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrCodeRegionId = "qr-reader"

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText)
            if (data.type === "product" && data.sku) {
              setScannedData(data.sku)
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
      setScanning(true)
    } catch (error) {
      toast.error("Kamera başlatılamadı")
      console.error(error)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedData) {
      toast.error("Lütfen önce QR kod okuyun")
      return
    }

    setLoading(true)

    try {
      // SKU'dan ürün ID'sini bul
      const productsRes = await fetch("/api/products")
      const products = await productsRes.json()
      const product = products.find((p: any) => p.sku === scannedData)

      if (!product) {
        toast.error("Ürün bulunamadı")
        setLoading(false)
        return
      }

      const response = await fetch("/api/stock/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          type,
          quantity: parseInt(quantity),
          reason: reason || null,
        }),
      })

      if (response.ok) {
        toast.success(
          `Stok ${type === "IN" ? "girişi" : "çıkışı"} başarıyla yapıldı`
        )
        router.push("/stock")
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Kod Tarayıcı</h1>
        <p className="mt-2 text-sm text-gray-600">
          QR kod ile hızlı stok işlemi yapın
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Kod Okuma
          </CardTitle>
          <CardDescription>Ürün QR kodunu tarayın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanning && !scannedData && (
            <Button onClick={startScanning} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Kamerayı Başlat
            </Button>
          )}

          {scanning && (
            <div className="space-y-4">
              <div id={qrCodeRegionId} className="w-full" />
              <Button onClick={stopScanning} variant="outline" className="w-full">
                Taramayı Durdur
              </Button>
            </div>
          )}

          {scannedData && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  QR Kod Okundu: {scannedData}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>İşlem Tipi</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "IN" | "OUT")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="IN">Giriş</option>
                    <option value="OUT">Çıkış</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Miktar</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    placeholder="Miktar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Sebep (Opsiyonel)</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="İşlem sebebi"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading || !quantity}
                    className={
                      type === "IN"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {loading ? "İşleniyor..." : "İşlemi Tamamla"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setScannedData(null)
                      setQuantity("")
                      setReason("")
                    }}
                  >
                    Sıfırla
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

