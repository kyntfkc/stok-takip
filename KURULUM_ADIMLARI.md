# Stok Takip Uygulaması - Sunucu Kurulum Adımları

## Durum
- ✅ Proje GitHub'dan klonlandı: `/root/stok-takip`
- ✅ .env dosyası oluşturuldu ve yapılandırıldı
- ✅ Port 3003'e ayarlandı (3000 kullanımda)
- ⏳ Bağımlılıklar yükleniyor (ağ sorunu nedeniyle bekleniyor)

## Kurulum Adımları

### 1. Bağımlılıkları Yükle
```bash
cd /root/stok-takip
npm ci
```

### 2. Prisma Client Oluştur
```bash
npx prisma generate
```

### 3. Veritabanını Başlat
```bash
npx prisma migrate deploy
```

### 4. (Opsiyonel) Demo Verileri Yükle
```bash
npm run db:seed
```

### 5. Production Build
```bash
npm run build
```

### 6. Uygulamayı Başlat

**PM2 ile (Önerilen):**
```bash
npm install -g pm2
pm2 start npm --name "stok-takip" -- start
pm2 save
pm2 startup
```

**Veya direkt:**
```bash
npm start
```

## Erişim
- URL: http://94.138.207.212:3003
- Port: 3003

## Docker ile Kurulum (Alternatif)

Ağ sorunu çözüldükten sonra:
```bash
cd /root/stok-takip
docker compose build
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

## Notlar
- Veritabanı: SQLite (`prisma/dev.db`)
- NextAuth Secret: Güvenli bir key oluşturuldu
- Port: 3003 (3000 kullanımda olduğu için)

