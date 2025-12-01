import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import dynamic from "next/dynamic"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const ProductionFlow = dynamic(() => import("@/components/production/ProductionFlow").then(mod => ({ default: mod.ProductionFlow })), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  ),
})

async function ProductionContent() {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: {
          in: ["NEW", "IN_PRODUCTION"],
        },
      },
    },
    include: {
      product: true,
      order: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return <ProductionFlow orderItems={orderItems} />
}

export default async function ProductionPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <ProductionContent />
    </Suspense>
  )
}

