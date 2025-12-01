# GitHub Actions ile Build Rehberi

## Kurulum Tamamlandı ✅

GitHub Actions workflow dosyası oluşturuldu: `.github/workflows/build.yml`

## Kullanım

### 1. GitHub'a Push Edin

```bash
cd D:\cursor\stok-takip
git add .
git commit -m "Add GitHub Actions build workflow"
git push origin main
# veya
git push origin master
```

### 2. GitHub'da Actions Sekmesine Gidin

1. GitHub repository'nize gidin: https://github.com/kyntfkc/stok-takip
2. "Actions" sekmesine tıklayın
3. "Build Next.js Application" workflow'unu seçin

### 3. Workflow'u Çalıştırın

**Otomatik:** Her push'ta otomatik çalışır

**Manuel:**
1. Actions sekmesinde "Build Next.js Application" workflow'unu seçin
2. "Run workflow" butonuna tıklayın
3. Branch seçin (main/master)
4. "Run workflow" butonuna tıklayın

### 4. Build Tamamlandıktan Sonra

1. Workflow çalışmasını açın
2. "nextjs-build" veya "standalone-build" artifact'ını indirin
3. ZIP dosyasını açın
4. İçeriği sunucuya yükleyin

## Sunucuya Yükleme

### Standalone Build (Önerilen)

```bash
# ZIP'i açın
unzip standalone-build.zip

# Sunucuya yükleyin (FileZilla ile)
# standalone/ klasörünü → /root/stok-takip/.next/standalone
# static/ klasörünü → /root/stok-takip/.next/static
# public/ klasörünü → /root/stok-takip/public

# Sunucuda çalıştırın
cd /root/stok-takip/.next/standalone
node server.js
```

### Normal Build

```bash
# ZIP'i açın
unzip nextjs-build.zip

# Sunucuya yükleyin (FileZilla ile)
# .next/ klasörünü → /root/stok-takip/.next
# public/ klasörünü → /root/stok-takip/public

# Sunucuda çalıştırın
cd /root/stok-takip
npm start
```

## Avantajlar

✅ Windows'ta build yapmaya gerek yok
✅ Her push'ta otomatik build
✅ Linux'ta build yapıldığı için SWC sorunu yok
✅ Artifact olarak indirilebilir
✅ 7 gün saklanır

## Notlar

- İlk build biraz zaman alabilir (~5-10 dakika)
- Build başarısız olursa Actions sekmesinde hataları görebilirsiniz
- Artifact'lar 7 gün sonra otomatik silinir

