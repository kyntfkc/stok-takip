"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Kullanıcı adı veya şifre hatalı")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center mb-6 gap-1.5">
            <div className="relative w-48 h-auto flex items-center justify-center min-h-[80px]">
              {logoError ? (
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Stok Takip</h1>
                  <p className="text-sm text-gray-500">İndigo Takı</p>
                </div>
              ) : (
                <Image
                  src="/logo.png"
                  alt="indigo TAKI"
                  width={192}
                  height={120}
                  className="w-full h-auto object-contain max-w-full"
                  style={{ display: 'block', maxHeight: '120px' }}
                  unoptimized
                  onError={(e) => {
                    console.error("Logo yüklenemedi, fallback gösteriliyor")
                    setLogoError(true)
                  }}
                  onLoad={() => {
                    console.log("Logo başarıyla yüklendi")
                  }}
                />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">Stok Takip Sistemi</CardTitle>
          <CardDescription className="mt-2">Giriş yapmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="kullanici_adi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Giriş Yap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

