// Enum types - Prisma'dan otomatik generate edilir
export type Role = "ADMIN" | "OPERATION" | "WORKSHOP"
export type OrderStatus = "NEW" | "IN_PRODUCTION" | "COMPLETED" | "CANCELLED"
export type StockTransactionType = "IN" | "OUT"
export type ProductionStage = "TO_PRODUCE" | "WAX_PRESSING" | "WAX_READY" | "CASTING" | "BENCH" | "POLISHING" | "PACKAGING" | "COMPLETED"

export interface DashboardStats {
  totalProducts: number
  totalStock: number
  lowStockProducts: number
  activeOrders: number
  completedOrdersToday: number
}

