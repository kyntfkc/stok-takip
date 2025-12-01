import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

interface Transaction {
  id: string
  type: "IN" | "OUT"
  quantity: number
  reason: string | null
  createdAt: Date
  product: {
    name: string
    sku: string
    imageUrl: string | null
  }
  user: {
    name: string | null
    email: string
  } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Stok Hareketleri</CardTitle>
          <CardDescription>En son yapılan stok işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<History className="h-12 w-12 text-gray-300" />}
            title="Henüz stok hareketi bulunmuyor"
            description="Stok işlemleri burada görüntülenecek"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Son Stok Hareketleri
        </CardTitle>
        <CardDescription>En son yapılan stok işlemleri</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((transaction) => {
            const imageUrl = transaction.product.imageUrl || getProductImageUrl(transaction.product.name, transaction.product.sku)
            return (
              <div
                key={transaction.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={transaction.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={transaction.type === "IN" ? "default" : "secondary"}
                      className={
                        transaction.type === "IN"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }
                    >
                      {transaction.type === "IN" ? "Giriş" : "Çıkış"}
                    </Badge>
                    <span className="font-semibold text-sm text-gray-900">
                      {transaction.quantity} adet
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {transaction.product.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    SKU: {transaction.product.sku}
                    {transaction.reason && (
                      <span className="ml-1 text-gray-600">• {transaction.reason}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", {
                      locale: tr,
                    })}
                    {transaction.user && (
                      <span className="ml-1">
                        • {transaction.user.name || transaction.user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

