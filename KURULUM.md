# Sunucuya Kurulum Rehberi - Adım Adım

Bu rehber, Stok Takip uygulamasını Linux sunucusuna kurmak için detaylı adımları içerir.

## Yöntem 1: Docker ile Kurulum (Önerilen - En Kolay)

### Gereksinimler
- Linux sunucu (Ubuntu/Debian önerilir)
- SSH erişimi
- Root veya sudo yetkisi

### Adım 1: Sunucuya Bağlanın

```bash
ssh kullanici@sunucu-ip
```

### Adım 2: Docker ve Docker Compose Kurun

```bash
# Güncellemeleri yapın
sudo apt update
sudo apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo apt install docker-compose -y

# Docker'ı başlatın
sudo systemctl start docker
sudo systemctl enable docker

# Kullanıcıyı docker grubuna ekleyin (root olmadan çalışması için)
sudo usermod -aG docker $USER
# Çıkış yapıp tekrar giriş yapın veya:
newgrp docker
```

### Adım 3: Projeyi Sunucuya Yükleyin

**Seçenek A: Git ile (Önerilen)**
```bash
# Git kurun (yoksa)
sudo apt install git -y

# Projeyi klonlayın
git clone <repository-url> stok-takip
cd stok-takip
```

**Seçenek B: Manuel Yükleme**
```bash
# Bilgisayarınızdan sunucuya dosyaları yükleyin
# scp veya FTP kullanarak tüm proje dosyalarını yükleyin
scp -r /yerel/proje/yolu/* kullanici@sunucu-ip:/home/kullanici/stok-takip/
```

### Adım 4: Environment Variables Ayarlayın

```bash
# .env dosyası oluşturun
nano .env
```

Aşağıdaki içeriği ekleyin ve değerleri değiştirin:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth - ÖNEMLİ: Güçlü bir secret oluşturun
NEXTAUTH_URL="http://sunucu-ip:3000"
NEXTAUTH_SECRET="buraya-guclu-bir-secret-key-yazin-en-az-32-karakter"

# Telegram (Opsiyonel - kullanmıyorsanız boş bırakın)
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

# Node Environment
NODE_ENV="production"
```

**NEXTAUTH_SECRET oluşturma:**
```bash
openssl rand -base64 32
```

### Adım 5: Docker ile Çalıştırın

```bash
# Docker image'ı build edin ve container'ı başlatın
docker-compose up -d

# Logları kontrol edin
docker-compose logs -f
```

### Adım 6: Veritabanını Başlatın

```bash
# Container içine girin
docker-compose exec app sh

# Prisma migration çalıştırın
npx prisma migrate deploy

# Prisma Client oluşturun
npx prisma generate

# (Opsiyonel) İlk admin kullanıcısı oluşturmak için seed çalıştırın
# npm run db:seed

# Çıkış yapın
exit
```

### Adım 7: Uygulamaya Erişin

Tarayıcınızda şu adrese gidin:
```
http://sunucu-ip:3000
```

---

## Yöntem 2: Manuel Kurulum (Docker Olmadan)

### Adım 1: Node.js Kurun

```bash
# Node.js 20+ kurun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyonu kontrol edin
node --version  # v20.x.x olmalı
npm --version
```

### Adım 2: Projeyi Kurun

```bash
# Proje klasörüne gidin
cd stok-takip

# Bağımlılıkları yükleyin
npm ci

# Prisma Client oluşturun
npx prisma generate

# Veritabanını başlatın
npx prisma migrate deploy

# Production build
npm run build
```

### Adım 3: PM2 ile Çalıştırın

```bash
# PM2 kurun
sudo npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "stok-takip" -- start

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup
pm2 save

# Durumu kontrol edin
pm2 status
pm2 logs stok-takip
```

---

## Domain ve SSL Kurulumu (Opsiyonel)

### Nginx Reverse Proxy Kurulumu

```bash
# Nginx kurun
sudo apt install nginx -y

# Nginx config oluşturun
sudo nano /etc/nginx/sites-available/stok-takip
```

Aşağıdaki içeriği ekleyin:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Domain'inizi yazın

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Config'i aktifleştirin
sudo ln -s /etc/nginx/sites-available/stok-takip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Kurulumu (Let's Encrypt)

```bash
# Certbot kurun
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası alın
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme test edin
sudo certbot renew --dry-run
```

**Önemli:** SSL kurulumundan sonra `.env` dosyasındaki `NEXTAUTH_URL`'i güncelleyin:
```env
NEXTAUTH_URL="https://your-domain.com"
```

Ve uygulamayı yeniden başlatın:
```bash
# Docker kullanıyorsanız
docker-compose restart

# PM2 kullanıyorsanız
pm2 restart stok-takip
```

---

## Güvenlik Duvarı Ayarları

```bash
# UFW firewall kurun (yoksa)
sudo apt install ufw -y

# Gerekli portları açın
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Uygulama (sadece Nginx kullanmıyorsanız)

# Firewall'u aktifleştirin
sudo ufw enable
sudo ufw status
```

---

## Yedekleme

### Veritabanı Yedekleme

```bash
# Yedekleme script'i oluşturun
nano backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/kullanici/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Yedek klasörü oluştur
mkdir -p $BACKUP_DIR

# Docker kullanıyorsanız
docker-compose exec -T app cp prisma/dev.db prisma/dev.db.backup.$DATE

# Veya manuel
cp prisma/dev.db $BACKUP_DIR/dev.db.$DATE

# Eski yedekleri sil (30 günden eski)
find $BACKUP_DIR -name "dev.db.*" -mtime +30 -delete

echo "Yedekleme tamamlandı: $DATE"
```

```bash
# Çalıştırılabilir yapın
chmod +x backup.sh

# Cron ile otomatik yedekleme (her gün saat 02:00)
crontab -e
# Şunu ekleyin:
0 2 * * * /home/kullanici/stok-takip/backup.sh
```

---

## Güncelleme

```bash
# Git'ten son değişiklikleri çekin
git pull

# Docker kullanıyorsanız
docker-compose build
docker-compose up -d
docker-compose exec app npx prisma migrate deploy

# PM2 kullanıyorsanız
npm ci
npm run build
pm2 restart stok-takip
npx prisma migrate deploy
```

---

## Sorun Giderme

### Port 3000 Kullanımda

```bash
# Hangi process kullanıyor kontrol edin
sudo lsof -i :3000

# Process'i durdurun
sudo kill -9 <PID>
```

### Docker Container Çalışmıyor

```bash
# Container durumunu kontrol edin
docker-compose ps

# Logları kontrol edin
docker-compose logs -f app

# Container'ı yeniden başlatın
docker-compose restart
```

### Veritabanı Hatası

```bash
# Prisma Client'ı yeniden oluşturun
docker-compose exec app npx prisma generate

# Migration durumunu kontrol edin
docker-compose exec app npx prisma migrate status
```

### PM2 Sorunları

```bash
# Logları kontrol edin
pm2 logs stok-takip --lines 100

# Uygulamayı yeniden başlatın
pm2 restart stok-takip

# Tüm PM2 process'lerini göster
pm2 list
```

---

## Hızlı Komutlar Özeti

```bash
# Docker ile başlatma
docker-compose up -d

# Docker ile durdurma
docker-compose down

# Logları görüntüleme
docker-compose logs -f

# Container içine girme
docker-compose exec app sh

# PM2 ile başlatma
pm2 start npm --name "stok-takip" -- start

# PM2 ile durdurma
pm2 stop stok-takip

# PM2 logları
pm2 logs stok-takip
```

---

## İlk Kullanıcı Oluşturma

Uygulama ilk açıldığında admin kullanıcısı yoksa, seed script'i çalıştırın:

```bash
# Docker ile
docker-compose exec app npm run db:seed

# Manuel
npm run db:seed
```

Veya doğrudan veritabanına admin kullanıcısı ekleyin (seed.ts dosyasını kontrol edin).

---

## Destek

Sorun yaşarsanız:
1. Logları kontrol edin (`docker-compose logs` veya `pm2 logs`)
2. Veritabanı durumunu kontrol edin (`npx prisma migrate status`)
3. Port'ların açık olduğundan emin olun (`sudo ufw status`)

