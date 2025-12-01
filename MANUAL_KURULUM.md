# Manuel Kurulum Rehberi

## Bilgisayarınızda Yapılacaklar

### 1. Projeyi Açın
```bash
cd D:\cursor\stok-takip
# veya GitHub'dan klonlayın
git clone https://github.com/kyntfkc/stok-takip.git
cd stok-takip
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
npm ci
```

### 3. node_modules'ı Hazırlayın
**Seçenek A: Tüm node_modules'ı zip'leyin (Büyük dosya - ~500MB+)**
```bash
# Windows PowerShell'de:
Compress-Archive -Path node_modules -DestinationPath node_modules.zip
```

**Seçenek B: Sadece gerekli dosyaları yükleyin (Önerilen)**
- `node_modules` klasörünü FileZilla ile direkt aktarın
- Veya tar ile sıkıştırın (Linux'ta)

### 4. .next ve prisma Klasörlerini Hazırlayın (Opsiyonel)
Eğer build yaparsanız:
```bash
npm run build
# .next klasörü oluşacak
```

## Sunucuya Yükleme (FileZilla ile)

### 1. FileZilla ile Bağlanın
- Host: 94.138.207.212
- Protocol: SFTP
- Port: 22
- User: root
- Password: [şifreniz]

### 2. Dosyaları Yükleyin
**Yüklenecekler:**
- `node_modules` klasörü → `/root/stok-takip/node_modules`
- (Opsiyonel) `.next` klasörü → `/root/stok-takip/.next` (eğer build yaptıysanız)

**Yüklenmeyecekler:**
- `.git` klasörü (gerekli değil)
- `node_modules.zip` (eğer zip kullandıysanız, sunucuda açılacak)

### 3. Sunucuda Açma (Eğer zip kullandıysanız)
```bash
cd /root/stok-takip
unzip node_modules.zip
```

## Sunucuda Kurulum

### 1. Prisma Client Oluştur
```bash
cd /root/stok-takip
npx prisma generate
```

### 2. Veritabanını Başlat
```bash
npx prisma migrate deploy
```

### 3. (Opsiyonel) Demo Verileri Yükle
```bash
npm run db:seed
```

### 4. Build (Eğer yapmadıysanız)
```bash
npm run build
```

### 5. Uygulamayı Başlat

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

## Notlar
- node_modules klasörü büyük olabilir (500MB+), yükleme biraz zaman alabilir
- FileZilla'da transfer modunu "Binary" olarak ayarlayın
- İlk yüklemede timeout olabilir, tekrar deneyin

