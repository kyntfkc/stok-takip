# Kurulum Durumu

## Sorun
Sunucu npm registry'ye bağlanamıyor (network timeout).

## Yapılanlar
✅ Proje GitHub'dan klonlandı: `/root/stok-takip`
✅ .env dosyası oluşturuldu
✅ Port 3003'e ayarlandı
❌ npm paketleri yüklenemedi (ağ sorunu)

## Çözüm Önerileri

### 1. Ağ Bağlantısını Kontrol Et
```bash
ping registry.npmjs.org
curl https://registry.npmjs.org/
```

### 2. Proxy Ayarları (Eğer proxy varsa)
```bash
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

### 3. Alternatif Registry Kullan
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 4. Manuel Kurulum (Bilgisayarınızdan)
Bilgisayarınızda:
```bash
cd D:\cursor\stok-takip
npm install
# node_modules klasörünü zip'leyip sunucuya yükleyin
```

Sunucuda:
```bash
cd /root/stok-takip
# node_modules.zip'i açın
unzip node_modules.zip
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### 5. Docker ile (Ağ düzeldikten sonra)
```bash
docker compose build
docker compose up -d
```

## Mevcut Dosyalar
- ✅ package.json
- ✅ package-lock.json  
- ✅ .env (yapılandırıldı)
- ✅ docker-compose.yml (port 3003)
- ❌ node_modules (yüklenemedi)

## Sonraki Adımlar
Ağ sorunu çözüldükten sonra:
1. `npm ci` veya `npm install`
2. `npx prisma generate`
3. `npx prisma migrate deploy`
4. `npm run build`
5. `npm start` veya PM2 ile başlat

