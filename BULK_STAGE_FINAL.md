# Final Düzeltme - bulk-stage/route.ts

## Değişiklikler

**Satır 43 (transaction tipi):**
```typescript
// Eski:
const result = await prisma.$transaction(async (tx) => {

// Yeni:
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const result = await prisma.$transaction(async (tx: any) => {
```

**Not:** Prisma transaction callback tipi karmaşık olduğu için `any` kullanıldı. Bu TypeScript hatasını çözer.

## FileZilla ile Güncelleme

1. FileZilla'da sunucuya bağlanın
2. Şu dosyayı Windows'a indirin (üzerine yazın):
   - `/root/stok-takip/app/api/orders/items/bulk-stage/route.ts` → `D:\cursor\stok-takip\app\api\orders\items\bulk-stage\route.ts`

3. Build yapın:
```powershell
cd D:\cursor\stok-takip
npm run build
```

