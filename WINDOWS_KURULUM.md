# Windows'ta Kurulum Rehberi

## Adım 1: Projeyi Bulun veya Klonlayın

### Seçenek A: GitHub'dan Klonlayın (Önerilen)
```powershell
# Git kurulu olmalı
cd D:\cursor
git clone https://github.com/kyntfkc/stok-takip.git
cd stok-takip
```

### Seçenek B: Mevcut Dizini Bulun
```powershell
# Projenin nerede olduğunu bulun
Get-ChildItem -Path D:\ -Recurse -Directory -Filter "stok-takip" -ErrorAction SilentlyContinue | Select-Object FullName
```

### Seçenek C: Yeni Dizin Oluşturun
```powershell
cd D:\cursor
mkdir stok-takip
cd stok-takip
git clone https://github.com/kyntfkc/stok-takip.git .
```

## Adım 2: Bağımlılıkları Yükleyin

```powershell
# Doğru dizinde olduğunuzdan emin olun
cd D:\cursor\stok-takip
# veya bulduğunuz dizin

# package.json dosyasının varlığını kontrol edin
Test-Path package.json

# Bağımlılıkları yükleyin
npm install
```

## Adım 3: node_modules'ı Hazırlayın

### Seçenek A: Zip Oluşturun (Önerilen)
```powershell
cd D:\cursor\stok-takip
Compress-Archive -Path node_modules -DestinationPath node_modules.zip -Force
```

### Seçenek B: FileZilla ile Direkt Aktarın
- `node_modules` klasörünü direkt sürükleyip bırakın

## Adım 4: FileZilla ile Sunucuya Yükleyin

1. FileZilla'yı açın
2. Bağlanın:
   - Host: 94.138.207.212
   - Protocol: SFTP
   - Port: 22
   - User: root
   - Password: [şifreniz]

3. Sol tarafta (Local): `D:\cursor\stok-takip\node_modules`
4. Sağ tarafta (Remote): `/root/stok-takip/`
5. `node_modules` klasörünü sürükleyip bırakın

## Adım 5: Sunucuda Kurulum

Dosyalar yüklendikten sonra sunucuda:
```bash
cd /root/stok-takip
./kurulum.sh
```

## Sorun Giderme

### "Dizin bulunamadı" hatası
- Projenin gerçek konumunu bulun
- Veya GitHub'dan klonlayın

### npm install hataları
- Node.js kurulu mu kontrol edin: `node --version`
- npm kurulu mu kontrol edin: `npm --version`
- İnternet bağlantısını kontrol edin

### FileZilla bağlantı hatası
- SSH portunun açık olduğundan emin olun
- Firewall ayarlarını kontrol edin

