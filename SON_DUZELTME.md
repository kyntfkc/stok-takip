# Son Düzeltme - page.tsx

## Değişiklik

**app/(dashboard)/page.tsx** dosyasında:

**Satır 10 (import ekle):**
```typescript
import type { StockTransactionType } from "@/lib/types"
```

**Satır 100-107 (tipleri düzelt):**
```typescript
const todayIn = todayTransactions
  .filter((t: { type: StockTransactionType; quantity: number }) => t.type === "IN")
  .reduce((sum: number, t: { type: StockTransactionType; quantity: number }) => sum + t.quantity, 0)

const todayOut = todayTransactions
  .filter((t: { type: StockTransactionType; quantity: number }) => t.type === "OUT")
  .reduce((sum: number, t: { type: StockTransactionType; quantity: number }) => sum + t.quantity, 0)
```

## FileZilla ile Güncelleme

1. FileZilla'da sunucuya bağlanın
2. Şu dosyayı Windows'a indirin (üzerine yazın):
   - `/root/stok-takip/app/(dashboard)/page.tsx` → `D:\cursor\stok-takip\app\(dashboard)\page.tsx`

3. Build yapın:
```powershell
cd D:\cursor\stok-takip
npm run build
```

