import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface Transaction {
  id: string
  type: "IN" | "OUT"
  quantity: number
  reason: string | null
  createdAt: Date
  product: {
    name: string
    sku: string
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
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Henüz stok hareketi bulunmuyor</p>
          </div>
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
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={transaction.type === "IN" ? "default" : "secondary"}
                    className={
                      transaction.type === "IN"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  >
                    {transaction.type === "IN" ? "Giriş" : "Çıkış"}
                  </Badge>
                  <span className="font-medium text-gray-900">
                    {transaction.quantity} adet
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {transaction.product.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  SKU: {transaction.product.sku}
                  {transaction.reason && ` • ${transaction.reason}`}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}
                  {transaction.user && ` • ${transaction.user.name || transaction.user.email}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

