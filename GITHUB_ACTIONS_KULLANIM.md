# GitHub Actions Kullanım Rehberi

## Hızlı Başlangıç

### 1. Dosyaları GitHub'a Push Edin

**Windows PowerShell'de:**
```powershell
cd D:\cursor\stok-takip

# Değişiklikleri kontrol edin
git status

# Tüm değişiklikleri ekleyin
git add .

# Commit yapın
git commit -m "Add GitHub Actions workflows and fixes"

# Push edin
git push origin main
# veya
git push origin master
```

### 2. GitHub'da Build'i Başlatın

1. **GitHub Repository'ye gidin:**
   - https://github.com/kyntfkc/stok-takip

2. **Actions sekmesine tıklayın**

3. **"Build Next.js Application" workflow'unu seçin**

4. **"Run workflow" butonuna tıklayın:**
   - Branch: `main` veya `master`
   - "Run workflow" butonuna tıklayın

5. **Build'in tamamlanmasını bekleyin** (~5-10 dakika)

### 3. Build Artifact'ını İndirin

1. **Workflow çalışmasını açın** (yeşil tik işareti)

2. **"Artifacts" bölümüne gidin**

3. **"standalone-build" veya "nextjs-build" artifact'ını indirin**

4. **ZIP dosyasını açın**

### 4. Sunucuya Yükleme

#### Standalone Build (Önerilen)

**FileZilla ile:**
- `standalone/` klasörünü → `/root/stok-takip/.next/standalone`
- `static/` klasörünü → `/root/stok-takip/.next/static`  
- `public/` klasörünü → `/root/stok-takip/public`

**Sunucuda:**
```bash
cd /root/stok-takip/.next/standalone
node server.js
```

#### Normal Build

**FileZilla ile:**
- `.next/` klasörünü → `/root/stok-takip/.next`
- `public/` klasörünü → `/root/stok-takip/public`

**Sunucuda:**
```bash
cd /root/stok-takip
npm start
```

## Otomatik Build

Her push'ta otomatik build yapılır. Sadece Actions sekmesinden artifact'ı indirmeniz yeterli.

## PM2 ile Çalıştırma

```bash
# Standalone için
cd /root/stok-takip/.next/standalone
pm2 start server.js --name "stok-takip"

# Normal build için
cd /root/stok-takip
pm2 start npm --name "stok-takip" -- start
```

## Sorun Giderme

### Build Başarısız Olursa
- Actions sekmesinde hata mesajlarını kontrol edin
- "View logs" butonuna tıklayarak detaylı logları görün

### Artifact Bulunamazsa
- Build'in tamamlandığından emin olun
- "Artifacts" bölümünün görünür olduğundan emin olun

### Sunucuda Çalışmazsa
- `.env` dosyasını kontrol edin
- Port'un açık olduğundan emin olun
- Logları kontrol edin: `pm2 logs stok-takip`

