"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { MessageSquare, CheckCircle2, XCircle, Bot } from "lucide-react"

export function TelegramSettings() {
  const [loading, setLoading] = useState(false)
  const [botInfo, setBotInfo] = useState<{ id: number; username: string; name: string } | null>(null)
  const [testResult, setTestResult] = useState<boolean | null>(null)

  useEffect(() => {
    checkBotConnection()
  }, [])

  const checkBotConnection = async () => {
    try {
      const response = await fetch("/api/notifications/telegram")
      if (response.ok) {
        const data = await response.json()
        if (data.bot) {
          setBotInfo(data.bot)
        }
      }
    } catch (error) {
      console.error("Bot bilgisi alınamadı:", error)
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/notifications/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "🧪 <b>Test Mesajı</b>\n\nTelegram entegrasyonu çalışıyor! ✅",
        }),
      })

      if (response.ok) {
        setTestResult(true)
        toast.success("Test mesajı başarıyla gönderildi")
      } else {
        setTestResult(false)
        const error = await response.json()
        toast.error(error.error || "Test mesajı gönderilemedi")
      }
    } catch (error) {
      setTestResult(false)
      toast.error("Bağlantı hatası")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Telegram Bildirim Ayarları
        </CardTitle>
        <CardDescription>
          Düşük stok bildirimlerini Telegram kanalına/grubuna göndermek için yapılandırın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {botInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">Bot Bağlantısı Aktif</p>
                <p className="text-xs text-green-700">
                  Bot: @{botInfo.username} ({botInfo.name})
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Not:</strong> Bu ayarlar environment variables (.env.local) üzerinden yapılandırılmalıdır.
            Aşağıdaki bilgiler sadece referans içindir.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="botToken">Bot Token</Label>
            <Input
              id="botToken"
              type="password"
              value="••••••••••••••••"
              disabled
              placeholder="Bot token"
            />
            <p className="text-xs text-gray-500">
              .env.local dosyasında TELEGRAM_BOT_TOKEN olarak ayarlayın
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatId">Chat ID</Label>
            <Input
              id="chatId"
              value="••••••••"
              disabled
              placeholder="Chat ID veya Kanal ID"
            />
            <p className="text-xs text-gray-500">
              .env.local dosyasında TELEGRAM_CHAT_ID olarak ayarlayın
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              onClick={handleTest}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                "Test ediliyor..."
              ) : (
                <>
                  {testResult === true && <CheckCircle2 className="h-4 w-4" />}
                  {testResult === false && <XCircle className="h-4 w-4" />}
                  Test Mesajı Gönder
                </>
              )}
            </Button>
            {testResult === true && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Bağlantı başarılı
              </span>
            )}
            {testResult === false && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Bağlantı başarısız
              </span>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Kurulum Adımları:</h4>
            <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
              <li>
                <strong>Telegram Bot Oluşturma:</strong>
                <ul className="ml-4 mt-1 space-y-1 list-disc">
                  <li>Telegram'da @BotFather'a gidin</li>
                  <li><code>/newbot</code> komutunu gönderin</li>
                  <li>Bot adını ve kullanıcı adını belirleyin</li>
                  <li>BotFather size bir token verecek, bunu kopyalayın</li>
                </ul>
              </li>
              <li>
                <strong>Chat ID Alma:</strong>
                <ul className="ml-4 mt-1 space-y-1 list-disc">
                  <li>Bot'u bir gruba veya kanala ekleyin</li>
                  <li>Gruba bir mesaj gönderin</li>
                  <li>Tarayıcıda şu URL'yi açın: <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code></li>
                  <li>JSON'da <code>chat.id</code> değerini bulun</li>
                  <li>Veya @userinfobot'a mesaj göndererek kendi chat ID'nizi öğrenebilirsiniz</li>
                </ul>
              </li>
              <li>
                <strong>Environment Variables:</strong>
                <pre className="mt-2 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
{`TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890`}
                </pre>
              </li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

