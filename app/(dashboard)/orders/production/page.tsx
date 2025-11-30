import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProductionFlow } from "@/components/production/ProductionFlow"
import { prisma } from "@/lib/prisma"

export default async function ProductionPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

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

