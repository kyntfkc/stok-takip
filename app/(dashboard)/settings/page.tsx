import { auth } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesManagement } from "@/components/settings/CategoriesManagement"
import { LabelSettings } from "@/components/settings/LabelSettings"
import { GeneralSettings } from "@/components/settings/GeneralSettings"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Sadece admin kategori yönetebilir
  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Sistem Ayarları
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Uygulama genel ayarlarını, etiket tasarımlarını ve kategorileri buradan yönetebilirsiniz.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-sm">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Genel Ayarlar
          </TabsTrigger>
          <TabsTrigger value="labels" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Barkod Etiketi
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Kategoriler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 focus-visible:outline-none">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="labels" className="space-y-4 focus-visible:outline-none">
          <LabelSettings />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 focus-visible:outline-none">
          <CategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
