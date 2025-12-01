# Stok Takip Sistemi

Modern ve kullanıcı dostu stok takip ve yönetim sistemi.

## Özellikler

- 📦 Ürün yönetimi
- 📊 Stok takibi ve raporlama
- 🏭 Üretim akışı yönetimi
- 📱 PWA desteği (mobil uygulama gibi kullanılabilir)
- 🔐 Kullanıcı yönetimi ve yetkilendirme
- 📸 QR kod okuma ve oluşturma
- 📈 Dashboard ve analitik

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

Detaylı kurulum rehberi için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

**Hızlı Docker Kurulumu:**

```bash
# Environment variables ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin

# Docker ile çalıştırın
docker-compose up -d

# Veritabanını başlatın
docker-compose exec app npx prisma migrate deploy
```

## Teknolojiler

- **Framework:** Next.js 16
- **Database:** SQLite (Prisma ORM)
- **Authentication:** NextAuth.js
- **UI:** Radix UI + Tailwind CSS
- **PWA:** next-pwa

## Lisans

Private - Tüm hakları saklıdır.
