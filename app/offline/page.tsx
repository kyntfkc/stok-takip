import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <WifiOff className="h-16 w-16 text-gray-400" />
          </div>
          <CardTitle className="text-2xl">İnternet Bağlantısı Yok</CardTitle>
          <CardDescription className="mt-2">
            İnternet bağlantınızı kontrol edin ve tekrar deneyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• İnternet bağlantınızı kontrol edin</p>
            <p>• Wi-Fi veya mobil veri bağlantınızı açın</p>
            <p>• Sayfayı yenileyin</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sayfayı Yenile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

