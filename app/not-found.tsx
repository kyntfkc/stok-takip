import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Sayfa Bulunamadı
        </h2>
        <p className="text-gray-500 mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </div>
  )
}

