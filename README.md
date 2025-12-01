# Stok Takip Sistemi

İndigo Takı için geliştirilmiş modern ve kullanıcı dostu stok takip ve üretim yönetim sistemi.

## Özellikler

- 📦 **Ürün Yönetimi**: CSV içe aktarım, QR kod oluşturma, arama ve filtreleme
- 📊 **Stok Takibi**: Manuel giriş/çıkış, QR kod ile hızlı işlem, düşük stok uyarıları
- 🏭 **Üretim Yönetimi**: Sipariş oluşturma, 6 aşamalı üretim süreci takibi
- 📱 **PWA Desteği**: Mobil uygulama gibi kullanılabilir, offline çalışma
- 🔐 **Kullanıcı Yönetimi**: 3 rol (Yönetici, Operasyon, Atölye), kullanıcı CRUD işlemleri
- 📸 **QR Kod**: Okuma ve oluşturma, etiket indirme (9x4.7cm)
- 📈 **Dashboard**: Günlük/haftalık/aylık raporlar ve grafikler
- 🔔 **Bildirimler**: Telegram ile düşük stok uyarıları
- ⚡ **Performans**: Optimize edilmiş sorgular, lazy loading, caching

## Hızlı Başlangıç

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükleyin
npm install

# Veritabanını hazırlayın
npx prisma migrate dev
npx prisma generate

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

### Production Kurulumu

Detaylı kurulum rehberi için [KURULUM.md](./KURULUM.md) ve [DEPLOYMENT.md](./DEPLOYMENT.md) dosyalarına bakın.

**Hızlı Docker Kurulumu:**

```bash
# Environment variables ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin (NEXTAUTH_SECRET önemli!)

# Docker ile çalıştırın
docker-compose up -d

# Veritabanını başlatın
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma generate
```

## Demo Kullanıcılar

Seed script çalıştırıldıktan sonra aşağıdaki kullanıcılarla giriş yapabilirsiniz:

- **Yönetici**: admin@indigo.com / admin123
- **Operasyon**: operation@indigo.com / operation123  
- **Atölye**: workshop@indigo.com / workshop123

## Üretim Aşamaları

1. Üretilecek (TO_PRODUCE)
2. Mum Basılıyor (WAX_PRESSING)
3. Mumu Hazır (WAX_READY)
4. Dökümde (CASTING)
5. Tezgah (BENCH)
6. Cila (POLISHING)
7. Paketleme (PACKAGING)
8. Tamamlandı (COMPLETED)

## Teknoloji Stack

- **Frontend/Backend:** Next.js 16+ (App Router)
- **Veritabanı:** SQLite (Prisma ORM) - Production için PostgreSQL'e geçiş mümkün
- **Authentication:** NextAuth.js v5
- **Styling:** TailwindCSS + Radix UI (shadcn/ui)
- **PWA:** next-pwa (offline support, install prompt)
- **QR Kod:** qrcode, html5-qrcode
- **CSV İşleme:** papaparse
- **Grafikler:** recharts
- **Deployment:** Docker, Docker Compose, PM2

## Lisans

Private - Tüm hakları saklıdır.
