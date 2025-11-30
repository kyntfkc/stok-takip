"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LabelSettingsData {
  width: number
  height: number
  showPrice: boolean
  showDate: boolean
  showSKU: boolean
  fontSize: "small" | "medium" | "large"
}

const defaultSettings: LabelSettingsData = {
  width: 800,
  height: 300,
  showPrice: false,
  showDate: false,
  showSKU: true,
  fontSize: "medium",
}

export function LabelSettings() {
  const [settings, setSettings] = useState<LabelSettingsData>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings?key=label_settings")
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSettings({ ...defaultSettings, ...data })
        }
      }
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error)
      toast.error("Ayarlar yüklenemedi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "label_settings",
          value: settings,
        }),
      })

      if (!response.ok) throw new Error("Kaydetme hatası")

      toast.success("Etiket ayarları kaydedildi")
    } catch (error) {
      console.error("Kaydetme hatası:", error)
      toast.error("Ayarlar kaydedilirken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60">
      <CardHeader>
        <CardTitle>Barkod Etiketi Ayarları</CardTitle>
        <CardDescription>Ürün etiketlerinin boyut ve içeriğini özelleştirin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="width">Genişlik (px)</Label>
            <Input
              id="width"
              type="number"
              value={settings.width}
              onChange={(e) => setSettings({ ...settings, width: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Yükseklik (px)</Label>
            <Input
              id="height"
              type="number"
              value={settings.height}
              onChange={(e) => setSettings({ ...settings, height: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontSize">Yazı Boyutu</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: "small" | "medium" | "large") =>
                setSettings({ ...settings, fontSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Küçük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="large">Büyük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Görünürlük Ayarları</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSKU"
              checked={settings.showSKU}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showSKU: checked as boolean })
              }
            />
            <Label htmlFor="showSKU">SKU Göster</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPrice"
              checked={settings.showPrice}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showPrice: checked as boolean })
              }
            />
            <Label htmlFor="showPrice">Fiyat Göster (Varsa)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDate"
              checked={settings.showDate}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showDate: checked as boolean })
              }
            />
            <Label htmlFor="showDate">Tarih Göster</Label>
          </div>
        </div>

        {/* Önizleme Alanı */}
        <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-4">Önizleme</h3>
            <div 
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 overflow-auto"
                style={{ minHeight: '200px' }}
            >
                <div
                    style={{
                        width: `${settings.width / 2}px`, // Önizlemede küçültüyoruz
                        height: `${settings.height / 2}px`,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        gap: '10px',
                        position: 'relative'
                    }}
                >
                    <div className="flex-1 flex flex-col justify-center">
                        <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: settings.fontSize === 'small' ? '10px' : settings.fontSize === 'medium' ? '14px' : '18px',
                            color: '#111827'
                        }}>
                            Örnek Ürün
                        </div>
                        {settings.showSKU && (
                            <div style={{ 
                                fontSize: settings.fontSize === 'small' ? '8px' : settings.fontSize === 'medium' ? '10px' : '12px',
                                color: '#374151'
                            }}>
                                ORN-URUN-001
                            </div>
                        )}
                        {settings.showPrice && (
                            <div style={{ fontSize: '10px', marginTop: '4px' }}>1.250 TL</div>
                        )}
                        {settings.showDate && (
                            <div style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>30.11.2025</div>
                        )}
                    </div>
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#000' }}></div>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">* Önizleme %50 küçültülmüştür</p>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

