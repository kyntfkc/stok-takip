# Sunucuya Kurulum Rehberi

Bu rehber, Stok Takip uygulamasını production sunucusuna kurmak için adımları içerir.

## Gereksinimler

- Docker ve Docker Compose yüklü olmalı
- En az 2GB RAM
- En az 10GB disk alanı

## Hızlı Başlangıç (Docker ile)

### 1. Dosyaları Sunucuya Yükleyin

```bash
# Projeyi klonlayın veya dosyaları yükleyin
git clone <repository-url>
cd stok
```

### 2. Environment Variables Ayarlayın

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin
nano .env
```

**Önemli:** `NEXTAUTH_SECRET` için güçlü bir secret key oluşturun:
```bash
openssl rand -base64 32
```

### 3. Docker ile Çalıştırın

```bash
# Build ve start
docker-compose up -d

# Logları kontrol edin
docker-compose logs -f
```

### 4. Veritabanını Başlatın

```bash
# Docker container içine girin
docker-compose exec app sh

# Prisma migration çalıştırın
npx prisma migrate deploy

# (Opsiyonel) Seed data ekleyin
npm run db:seed
```

### 5. Uygulamaya Erişin

Tarayıcınızda `http://sunucu-ip:3000` adresine gidin.

## Manuel Kurulum (Docker Olmadan)

### 1. Node.js ve npm Kurulumu

```bash
# Node.js 20+ kurun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# npm ve build araçları
sudo apt-get install -y build-essential
```

### 2. Projeyi Kurun

```bash
# Bağımlılıkları yükleyin
npm ci

# Prisma Client oluşturun
npx prisma generate

# Production build
npm run build
```

### 3. PM2 ile Çalıştırın

```bash
# PM2 kurun
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "stok-takip" -- start

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup
pm2 save
```

### 4. Nginx Reverse Proxy (Opsiyonel)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/HTTPS Kurulumu (Let's Encrypt)

```bash
# Certbot kurun
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme test edin
sudo certbot renew --dry-run
```

## Veritabanı Yedekleme

```bash
# SQLite veritabanını yedekleyin
cp prisma/dev.db prisma/dev.db.backup

# Veya Docker ile
docker-compose exec app cp prisma/dev.db prisma/dev.db.backup
```

## Güncelleme

```bash
# Git'ten son değişiklikleri çekin
git pull

# Docker ile yeniden build edin
docker-compose build
docker-compose up -d

# Migration'ları çalıştırın
docker-compose exec app npx prisma migrate deploy
```

## Sorun Giderme

### Port 3000 Kullanımda

```bash
# Port'u kontrol edin
sudo lsof -i :3000

# docker-compose.yml'de port'u değiştirin
ports:
  - "3001:3000"  # 3001 dış port, 3000 iç port
```

### Veritabanı Hatası

```bash
# Prisma Client'ı yeniden oluşturun
docker-compose exec app npx prisma generate

# Migration'ları kontrol edin
docker-compose exec app npx prisma migrate status
```

### Log Kontrolü

```bash
# Docker logs
docker-compose logs -f app

# PM2 logs
pm2 logs stok-takip
```

## Güvenlik Notları

1. **NEXTAUTH_SECRET**: Mutlaka güçlü bir secret key kullanın
2. **Firewall**: Sadece gerekli portları açın (80, 443, 22)
3. **SSL**: Production'da mutlaka HTTPS kullanın
4. **Backup**: Düzenli veritabanı yedekleri alın
5. **Updates**: Düzenli olarak güvenlik güncellemeleri yapın

## Performans İpuçları

- Production'da `NODE_ENV=production` ayarlandığından emin olun
- Docker kullanıyorsanız, yeterli memory limit ayarlayın
- Nginx reverse proxy ile caching ekleyebilirsiniz
- PM2 cluster mode kullanarak çoklu instance çalıştırabilirsiniz

