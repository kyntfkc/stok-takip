# Tüm Enum Import Düzeltmeleri

## Düzeltilen Dosyalar

### 1. app/(dashboard)/page.tsx
**Satır 10:**
```typescript
// Eski:
import { StockTransactionType } from "@prisma/client"

// Yeni:
import type { StockTransactionType } from "@/lib/types"
```

### 2. app/api/orders/items/bulk-stage/route.ts
**Satır 5:**
```typescript
// Eski:
import { ProductionStage } from "@prisma/client"

// Yeni:
import type { ProductionStage } from "@/lib/types"
```

**Satır 9:**
```typescript
// Eski:
stage: z.nativeEnum(ProductionStage),

// Yeni:
stage: z.enum(["TO_PRODUCE", "WAX_PRESSING", "WAX_READY", "CASTING", "BENCH", "POLISHING", "PACKAGING", "COMPLETED"]),
```

### 3. app/api/orders/route.ts
**Satır 5:**
```typescript
// Eski:
import { Prisma, ProductionStage, OrderStatus } from "@prisma/client"

// Yeni:
import { Prisma } from "@prisma/client"
import type { ProductionStage, OrderStatus } from "@/lib/types"
```

## FileZilla ile Güncelleme

Şu dosyaları Windows'a indirin (üzerine yazın):
1. `/root/stok-takip/app/(dashboard)/page.tsx` → `D:\cursor\stok-takip\app\(dashboard)\page.tsx`
2. `/root/stok-takip/app/api/orders/items/bulk-stage/route.ts` → `D:\cursor\stok-takip\app\api\orders\items\bulk-stage\route.ts`
3. `/root/stok-takip/app/api/orders/route.ts` → `D:\cursor\stok-takip\app\api\orders\route.ts`

## Build
```powershell
cd D:\cursor\stok-takip
npm run build
```

