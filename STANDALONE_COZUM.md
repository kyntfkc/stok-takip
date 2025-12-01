# Standalone Build Çözümü

## Durum
`next.config.ts`'de `output: 'standalone'` zaten aktif! Bu durumda:

## Windows'ta Yapılacaklar

1. **Build yapın:**
```powershell
cd D:\cursor\stok-takip
npm run build
```

2. **Standalone klasörünü yükleyin:**
FileZilla ile:
- `D:\cursor\stok-takip\.next\standalone` → `/root/stok-takip/.next/standalone`
- `D:\cursor\stok-takip\.next\static` → `/root/stok-takip/.next/static`
- `D:\cursor\stok-takip\public` → `/root/stok-takip/public` (eğer yoksa)

## Sunucuda Çalıştırma

```bash
cd /root/stok-takip/.next/standalone
node server.js
```

Veya PM2 ile:
```bash
cd /root/stok-takip/.next/standalone
pm2 start server.js --name "stok-takip"
```

## Avantajlar
- Tüm bağımlılıklar dahil
- node_modules gerektirmiyor
- Daha küçük ve taşınabilir
- Hızlı başlatma

## Not
Standalone build `.next/standalone` klasöründe tüm gerekli dosyaları içerir.

