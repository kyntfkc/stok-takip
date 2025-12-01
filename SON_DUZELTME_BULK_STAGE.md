# Son Düzeltme - bulk-stage/route.ts

## Değişiklikler

**Satır 5 (import ekle):**
```typescript
import type { Prisma } from "@prisma/client"
```

**Satır 43 (transaction tipi ekle):**
```typescript
// Eski:
const result = await prisma.$transaction(async (tx) => {

// Yeni:
const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
```

## FileZilla ile Güncelleme

1. FileZilla'da sunucuya bağlanın
2. Şu dosyayı Windows'a indirin (üzerine yazın):
   - `/root/stok-takip/app/api/orders/items/bulk-stage/route.ts` → `D:\cursor\stok-takip\app\api\orders\items\bulk-stage\route.ts`

3. Build yapın:
```powershell
cd D:\cursor\stok-takip
npm run build
```

