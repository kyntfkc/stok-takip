"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface GeneralSettingsData {
  companyName: string
  email: string
  phone: string
  address: string
}

const defaultSettings: GeneralSettingsData = {
  companyName: "Indigo Taki",
  email: "",
  phone: "",
  address: "",
}

export function GeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettingsData>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings?key=general_settings")
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
          key: "general_settings",
          value: settings,
        }),
      })

      if (!response.ok) throw new Error("Kaydetme hatası")

      toast.success("Genel ayarlar kaydedildi")
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
        <CardTitle>Genel Ayarlar</CardTitle>
        <CardDescription>Firma bilgileri ve genel sistem ayarları</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Firma Adı</Label>
          <Input
            id="companyName"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adres</Label>
          <Input
            id="address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
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

