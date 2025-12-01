import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesManagement } from "@/components/settings/CategoriesManagement"
import { LabelSettings } from "@/components/settings/LabelSettings"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { TelegramSettings } from "@/components/settings/TelegramSettings"
import { UsersManagement } from "@/components/settings/UsersManagement"

export default async function SettingsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // Sadece admin kategori yönetebilir
  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
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
          <TabsTrigger value="telegram" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Telegram
          </TabsTrigger>
          <TabsTrigger value="labels" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Barkod Etiketi
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Kategoriler
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Kullanıcılar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 focus-visible:outline-none">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="telegram" className="space-y-4 focus-visible:outline-none">
          <TelegramSettings />
        </TabsContent>

        <TabsContent value="labels" className="space-y-4 focus-visible:outline-none">
          <LabelSettings />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 focus-visible:outline-none">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="users" className="space-y-4 focus-visible:outline-none">
          <UsersManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
