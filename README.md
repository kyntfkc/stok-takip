# Stok Takip Sistemi

İndigo Takı için geliştirilmiş stok takip ve üretim yönetim sistemi.

## Özellikler

- **3 Kullanıcı Rolü**: Yönetici, Operasyon, Atölye
- **Ürün Yönetimi**: CSV içe aktarım, QR kod oluşturma, arama ve filtreleme
- **Stok Yönetimi**: Manuel giriş/çıkış, QR kod ile hızlı işlem
- **Sipariş Yönetimi**: Sipariş oluşturma, üretim takibi
- **Kanban Üretim Akışı**: 6 aşamalı üretim süreci takibi
- **Otomatik Stok Güncelleme**: Sipariş tamamlandığında stok otomatik artar
- **Raporlama**: Günlük/haftalık/aylık üretim raporları ve grafikler

## Teknoloji Stack

- **Frontend/Backend**: Next.js 14+ (App Router)
- **Veritabanı**: PostgreSQL (Prisma ORM)
- **Styling**: TailwindCSS + shadcn/ui
- **Authentication**: NextAuth.js
- **QR Kod**: qrcode, html5-qrcode
- **CSV İşleme**: papaparse
- **Grafikler**: recharts

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

3. `.env` dosyasında veritabanı bağlantısını yapılandırın:
```
DATABASE_URL="postgresql://user:password@localhost:5432/stok_takip?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Veritabanını oluşturun ve migrate edin:
```bash
npx prisma migrate dev
```

5. Demo verileri yükleyin:
```bash
npm run db:seed
```

6. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Demo Kullanıcılar

Seed script çalıştırıldıktan sonra aşağıdaki kullanıcılarla giriş yapabilirsiniz:

- **Yönetici**: admin@indigo.com / admin123
- **Operasyon**: operation@indigo.com / operation123
- **Atölye**: workshop@indigo.com / workshop123

## Üretim Aşamaları

1. Döküme Gönderilecek (PENDING_CASTING)
2. Mum Basılıyor (WAX_PRESSING)
3. Dökümde (CASTING)
4. Tezgah (BENCH)
5. Cila (POLISHING)
6. Paketleme (PACKAGING)
7. Tamamlandı (COMPLETED)

## Proje Yapısı

```
stok-takip/
├── app/
│   ├── (auth)/          # Authentication sayfaları
│   ├── (dashboard)/     # Dashboard sayfaları
│   └── api/             # API routes
├── components/          # React componentleri
├── lib/                 # Utility fonksiyonları
├── prisma/              # Prisma schema ve migrations
└── public/              # Static dosyalar
```

## Lisans

Bu proje özel bir projedir.
