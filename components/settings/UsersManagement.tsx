"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  email: string
  username: string
  name: string | null
  role: "ADMIN" | "OPERATION" | "WORKSHOP"
  createdAt: string
  updatedAt: string
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    name: "",
    role: "WORKSHOP" as "ADMIN" | "OPERATION" | "WORKSHOP",
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Kullanıcılar yüklenirken hata oluştu")
      }
    } catch (error) {
      toast.error("Kullanıcılar yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        username: user.username,
        password: "",
        name: user.name || "",
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: "",
        username: "",
        password: "",
        name: "",
        role: "WORKSHOP",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      email: "",
      username: "",
      password: "",
      name: "",
      role: "WORKSHOP",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.username || !formData.role) {
      toast.error("Email, kullanıcı adı ve rol gereklidir")
      return
    }

    if (!editingUser && !formData.password) {
      toast.error("Yeni kullanıcı için şifre gereklidir")
      return
    }

    setSubmitting(true)

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingUser ? "Kullanıcı güncellendi" : "Kullanıcı oluşturuldu")
        handleCloseDialog()
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || "İşlem başarısız")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return
    }

    setDeleting(id)

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Kullanıcı silindi")
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || "Kullanıcı silinirken hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setDeleting(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "OPERATION":
        return "default"
      case "WORKSHOP":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Yönetici"
      case "OPERATION":
        return "Operasyon"
      case "WORKSHOP":
        return "Atölye"
      default:
        return role
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
              <CardDescription>
                Sistem kullanıcılarını görüntüleyin, oluşturun ve yönetin
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (open) {
                handleOpenDialog()
              } else {
                handleCloseDialog()
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Kullanıcı
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Kullanıcı bilgilerini güncelleyin. Şifre alanını boş bırakırsanız şifre değişmez."
                      : "Yeni bir kullanıcı oluşturun"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        placeholder="ornek@indigo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Kullanıcı Adı *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                        placeholder="kullanici_adi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Şifre {!editingUser && "*"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={!editingUser}
                        placeholder={editingUser ? "Değiştirmek için yeni şifre girin" : "Şifre"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ad Soyad"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: "ADMIN" | "OPERATION" | "WORKSHOP") =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Yönetici</SelectItem>
                          <SelectItem value="OPERATION">Operasyon</SelectItem>
                          <SelectItem value="WORKSHOP">Atölye</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          İşleniyor...
                        </>
                      ) : editingUser ? (
                        "Güncelle"
                      ) : (
                        "Oluştur"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Henüz kullanıcı bulunmuyor
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email} • @{user.username}
                        </p>
                      </div>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user)
                        setFormData({
                          email: user.email,
                          username: user.username,
                          password: "",
                          name: user.name || "",
                          role: user.role,
                        })
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleting === user.id}
                    >
                      {deleting === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

