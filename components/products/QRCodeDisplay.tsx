"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

interface QRCodeDisplayProps {
  product: {
    id: string
    name: string
    sku: string
    qrCode: string | null
    imageUrl?: string | null
  }
}

export function QRCodeDisplay({ product }: QRCodeDisplayProps) {
  const labelRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadJPG = async () => {
    if (!product.qrCode || !labelRef.current) return

    setIsDownloading(true)
    try {
      // html-to-image kütüphanesini dynamic import ile yükle
      const { toJpeg } = await import("html-to-image")
      
      // html-to-image kütüphanesini kullanarak JPG oluştur
      // 9cm x 4.7cm için 300 DPI: 9cm = 1063px, 4.7cm = 555px
      // Ekranda: 340px x 178px (96 DPI)
      // İndirme için: 340 * 3.125 = 1063px, 178 * 3.118 = 555px
      const dataUrl = await toJpeg(labelRef.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: 3.125, // 300 DPI için (340px * 3.125 = 1063px ≈ 9cm @ 300 DPI)
        cacheBust: true,
      })

      const link = document.createElement("a")
      link.download = `${product.sku}-etiket.jpg`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Etiket başarıyla indirildi")
    } catch (error) {
      console.error("JPG oluşturma hatası:", error)
      toast.error("JPG oluşturulurken hata oluştu")
    } finally {
      setIsDownloading(false)
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
                width: "340px",
                height: "178px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                padding: "8px",
                boxSizing: "border-box",
                justifyContent: "space-between"
              }}
            >
              {/* Üst kısım - Sol: Görsel, Sağ: QR Kod */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "transparent",
                flex: "1",
                minHeight: 0
              }}>
                {/* Sol taraf - Ürün görseli */}
                <div style={{
                  flex: "1",
                  height: "100%",
                  maxHeight: "133px",
                  aspectRatio: "1",
                  backgroundColor: "#ffffff",
                  borderRadius: "2px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e5e7eb"
                }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "2px"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: "8px"
                    }}>
                      Görsel Yok
                    </div>
                  )}
                </div>

                {/* Sağ taraf - QR Kod */}
                <div style={{ 
                  flex: "1",
                  height: "100%",
                  maxHeight: "133px",
                  aspectRatio: "1",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <img
                    src={product.qrCode || ""}
                    alt="QR Code"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "contain"
                    }}
                  />
                </div>
              </div>

              {/* Alt kısım - Ürün adı ve SKU */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                paddingTop: "4px",
                borderTop: "1px solid #e5e7eb",
                flexShrink: 0,
                width: "100%"
              }}>
                <h2
                  style={{ 
                    fontSize: "11px", 
                    lineHeight: "1.3",
                    color: "#111827",
                    fontWeight: "600",
                    marginBottom: "2px",
                    backgroundColor: "transparent",
                    margin: "0 0 2px 0",
                    textAlign: "center",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {product.name}
                </h2>
                <p
                  style={{ 
                    fontSize: "9px",
                    color: "#6b7280",
                    fontWeight: "500",
                    backgroundColor: "transparent",
                    margin: "0",
                    textAlign: "center",
                    letterSpacing: "0.3px",
                    width: "100%"
                  }}
                >
                  {product.sku}
                </p>
              </div>
            </div>
          </div>

          {/* İndirme Butonu */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleDownloadJPG}
              disabled={isDownloading}
              loading={isDownloading}
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

