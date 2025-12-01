# Windows'ta Build Yapma

## Adım 1: Windows'ta Build Yapın

PowerShell'de:
```powershell
cd D:\cursor\stok-takip
npm run build
```

Bu işlem `.next` klasörünü oluşturacak.

## Adım 2: .next Klasörünü Sunucuya Yükleyin

FileZilla ile:
- Sol taraf: `D:\cursor\stok-takip\.next`
- Sağ taraf: `/root/stok-takip/`
- `.next` klasörünü sürükleyip bırakın

## Adım 3: Sunucuda Veritabanını Başlatın

Build tamamlandıktan sonra sunucuda:
```bash
cd /root/stok-takip
# Migration dosyası oluştur (eğer yoksa)
mkdir -p prisma/migrations/0_init
# Veritabanını oluştur
sqlite3 prisma/dev.db < prisma/schema.sql  # veya Prisma migrate
```

## Alternatif: Sunucuda Build (Ağ Sorunu Çözülünce)

Ağ bağlantısı düzeldiğinde:
```bash
cd /root/stok-takip
npm run build
npm start
```

