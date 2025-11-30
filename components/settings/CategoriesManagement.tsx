"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description: string | null
  _count?: {
    products: number
  }
}

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      toast.error("Kategoriler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      toast.error("Kategori adı gereklidir")
      return
    }

    setAdding(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
        }),
      })

      if (response.ok) {
        toast.success("Kategori eklendi")
        setNewCategoryName("")
        setNewCategoryDescription("")
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || "Kategori eklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? Bu kategoriye ait ürünlerin kategorisi kaldırılacak.")) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Kategori silindi")
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || "Kategori silinirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kategori Ekle</CardTitle>
          <CardDescription>Yeni bir kategori oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Kategori Adı *</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Örn: Gümüş Yüzük"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Açıklama</Label>
              <Input
                id="categoryDescription"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Kategori açıklaması (opsiyonel)"
              />
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Kategori Ekle
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kategoriler</CardTitle>
          <CardDescription>
            Mevcut kategorileri görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Henüz kategori eklenmemiş
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                    {category._count && (
                      <p className="text-xs text-gray-400 mt-1">
                        {category._count.products} ürün
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={deleting === category.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deleting === category.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

