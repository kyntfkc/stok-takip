#!/bin/bash
# Stok Takip Uygulaması Kurulum Scripti

echo "=== Stok Takip Kurulum Başlıyor ==="

cd /root/stok-takip

# node_modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "HATA: node_modules klasörü bulunamadı!"
    echo "Lütfen FileZilla ile node_modules klasörünü yükleyin."
    exit 1
fi

echo "✓ node_modules bulundu"

# Prisma Client oluştur
echo "Prisma Client oluşturuluyor..."
npx prisma generate

# Veritabanı migration
echo "Veritabanı migration çalıştırılıyor..."
npx prisma migrate deploy

# Build
echo "Production build yapılıyor..."
npm run build

echo ""
echo "=== Kurulum Tamamlandı ==="
echo ""
echo "Uygulamayı başlatmak için:"
echo "  npm start"
echo ""
echo "Veya PM2 ile:"
echo "  pm2 start npm --name 'stok-takip' -- start"
echo ""

