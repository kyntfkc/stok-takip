import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewOrders } from "@/components/orders/NewOrders"
import { ProductionOrders } from "@/components/orders/ProductionOrders"
import { CompletedOrders } from "@/components/orders/CompletedOrders"

export default async function OrdersPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Üretim Talepleri
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Üretim taleplerini yönetin ve üretim akışını takip edin
        </p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/60 p-1">
          <TabsTrigger value="new" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Yeni Talepler</TabsTrigger>
          <TabsTrigger value="production" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Üretim</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Tamamlandı</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-6">
          <NewOrders />
        </TabsContent>
        <TabsContent value="production" className="mt-6">
          <ProductionOrders />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <CompletedOrders />
        </TabsContent>
      </Tabs>
    </>
  )
}

