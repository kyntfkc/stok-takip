"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import Papa from "papaparse"

export default function ImportProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error("Lütfen bir dosya seçin")
      return
    }

    setLoading(true)

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const response = await fetch("/api/products/import", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ products: results.data }),
            })

            if (response.ok) {
              const data = await response.json()
              toast.success(`${data.count} ürün başarıyla içe aktarıldı`)
              router.push("/products")
            } else {
              const error = await response.json()
              toast.error(error.error || "İçe aktarma sırasında hata oluştu")
            }
          } catch (error) {
            toast.error("Bir hata oluştu")
          } finally {
            setLoading(false)
          }
        },
        error: (error) => {
          toast.error("CSV dosyası okunamadı: " + error.message)
          setLoading(false)
        },
      })
    } catch (error) {
      toast.error("Bir hata oluştu")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">CSV İçe Aktar</h1>
          <p className="mt-2 text-sm text-gray-600">
            CSV dosyasından ürünleri toplu olarak içe aktarın
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/60">
        <CardHeader>
          <CardTitle>Dosya Yükle</CardTitle>
          <CardDescription>
            İkas CSV formatı desteklenir: Name, SKU, Description, Barcode List
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">CSV Dosyası</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <FileSpreadsheet className="w-10 h-10 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">{file.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Dosya seçmek için tıklayın</span> veya sürükleyin
                        </p>
                        <p className="text-xs text-gray-500">CSV (MAX. 10MB)</p>
                      </>
                    )}
                  </div>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={loading || !file}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? "İçe Aktarılıyor..." : "İçe Aktar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-xl"
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

