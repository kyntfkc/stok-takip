# Veritabanı Seçimi Rehberi

## SQLite vs PostgreSQL

### SQLite - Mevcut Durum

**Avantajlar:**
- ✅ **5000 ürün için kesinlikle yeterli** - SQLite milyonlarca kayıtla çalışabilir
- ✅ Kurulum ve bakım kolay - tek dosya, yedekleme basit
- ✅ Sunucu gerektirmez - dosya tabanlı
- ✅ Düşük kaynak kullanımı (RAM, CPU)
- ✅ Küçük-orta ölçekli uygulamalar için ideal
- ✅ Geliştirme ve test için mükemmel

**Limitler:**
- ⚠️ Eşzamanlı yazma işlemleri sınırlı (WAL mode ile iyileştirilebilir)
- ⚠️ Tek sunucu üzerinde çalışır (dağıtık sistem yok)
- ⚠️ Çok yüksek trafikli senaryolarda performans düşebilir

### Ne Zaman SQLite Yeterli?

SQLite şu durumlarda **kesinlikle yeterlidir**:

- ✅ **5000 ürün** ve altı
- ✅ **10-50 eşzamanlı kullanıcı**
- ✅ **Günde 1000-5000 işlem** (stok giriş/çıkış, üretim aşaması değişiklikleri)
- ✅ Tek sunucu üzerinde çalışan uygulama
- ✅ Yüksek kullanılabilirlik gerektirmeyen sistemler

### Ne Zaman PostgreSQL'e Geçilmeli?

PostgreSQL'e geçiş şu durumlarda **önerilir**:

- 🔄 **100+ eşzamanlı kullanıcı**
- 🔄 **Günde 10,000+ işlem**
- 🔄 **Yüksek kullanılabilirlik** gereksinimi (99.9% uptime)
- 🔄 **Dağıtık sistem** (birden fazla sunucu)
- 🔄 **Gelişmiş özellikler** gereksinimi (full-text search, JSON queries, vb.)
- 🔄 **Yedekleme ve replikasyon** gereksinimi

## Mevcut Durumunuz İçin Öneri

**5000 ürün için SQLite kesinlikle yeterlidir!**

SQLite ile devam edebilirsiniz çünkü:
- 5000 ürün SQLite'ın kapasitesinin çok altında
- Küçük-orta ölçekli bir stok takip sistemi için ideal
- Bakımı ve yedeklemesi çok kolay
- Ekstra sunucu ve konfigürasyon gerektirmez

## SQLite Performans İyileştirmeleri

Eğer performans sorunları yaşarsanız (ki 5000 ürün için beklenmez), şunları yapabilirsiniz:

### 1. WAL Mode Aktifleştirme

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  // WAL mode için
  // DATABASE_URL="file:./prisma/dev.db?mode=rwc&journal_mode=WAL"
}
```

### 2. Index Optimizasyonu

```prisma
model Product {
  // ...
  sku           String   @unique
  currentStock  Int      @default(0)
  
  @@index([currentStock]) // Düşük stok sorguları için
  @@index([name]) // Arama için
}
```

### 3. Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Connection pool ayarları
// SQLite için connection pooling gerekmez ama Prisma otomatik yönetir
```

## PostgreSQL'e Geçiş (Gelecekte Gerekirse)

Eğer ileride PostgreSQL'e geçmek isterseniz:

### 1. Schema Güncelleme

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Migration

```bash
# PostgreSQL connection string ayarlayın
DATABASE_URL="postgresql://user:password@localhost:5432/stok_takip"

# Migration oluştur
npx prisma migrate dev --name postgresql_migration

# Verileri migrate et (manuel script gerekebilir)
```

### 3. Docker Compose ile PostgreSQL

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: stok_takip
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## Sonuç

**Şu an için SQLite ile devam edin!** 

5000 ürün için SQLite:
- ✅ Performans açısından yeterli
- ✅ Bakım açısından kolay
- ✅ Maliyet açısından uygun
- ✅ Kurulum açısından basit

PostgreSQL'e geçiş sadece:
- Kullanıcı sayısı 100+ olursa
- Günlük işlem sayısı 10,000+ olursa
- Yüksek kullanılabilirlik gereksinimi olursa

gerekli olur.

