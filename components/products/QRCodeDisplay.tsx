"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRef } from "react"
import { toJpeg } from "html-to-image"
import { toast } from "sonner"

interface QRCodeDisplayProps {
  product: {
    id: string
    name: string
    sku: string
    qrCode: string | null
  }
}

export function QRCodeDisplay({ product }: QRCodeDisplayProps) {
  const labelRef = useRef<HTMLDivElement>(null)

  const handleDownloadJPG = async () => {
    if (!product.qrCode || !labelRef.current) return

    try {
      // html-to-image kütüphanesini kullanarak JPG oluştur
      const dataUrl = await toJpeg(labelRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 3, // Yüksek çözünürlük için
      })

      const link = document.createElement("a")
      link.download = `${product.sku}-etiket.jpg`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("JPG oluşturma hatası:", error)
      toast.error("JPG oluşturulurken hata oluştu")
    }
  }

  if (!product.qrCode) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60">
        <CardHeader>
          <CardTitle>Ürün Etiketi</CardTitle>
          <CardDescription>Etiketi JPG formatında indirebilirsiniz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Etiket Önizleme */}
          <div className="overflow-auto pb-4">
            <div
              ref={labelRef}
              style={{
                width: "800px",
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "40px",
                backgroundColor: "#ffffff",
                border: "2px solid #e5e7eb",
                borderColor: "#e5e7eb",
                borderRadius: "8px",
                padding: "32px",
                boxSizing: "border-box",
              }}
            >
              {/* Sol taraf - Ürün bilgileri */}
              <div style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "transparent"
              }}>
                <h2
                  style={{ 
                    fontSize: "28px", 
                    lineHeight: "1.2",
                    color: "#111827",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    backgroundColor: "transparent",
                    margin: "0 0 12px 0"
                  }}
                >
                  {product.name}
                </h2>
                <p
                  style={{ 
                    fontSize: "20px",
                    color: "#374151",
                    fontWeight: "500",
                    backgroundColor: "transparent",
                    margin: "0"
                  }}
                >
                  {product.sku}
                </p>
              </div>

              {/* Sağ taraf - QR Kod */}
              <div style={{ 
                flexShrink: 0,
                backgroundColor: "transparent"
              }}>
                <img
                  src={product.qrCode || ""}
                  alt="QR Code"
                  style={{
                    width: "200px",
                    height: "200px",
                    display: "block"
                  }}
                />
              </div>
            </div>
          </div>

          {/* İndirme Butonu */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleDownloadJPG} 
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] px-4"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              JPG Olarak İndir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

