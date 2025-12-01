# FileZilla ile Yükleme Adımları

## 1. FileZilla'yı Açın ve Bağlanın

**Site Manager'da yeni site ekleyin:**
- Host: `94.138.207.212`
- Protocol: `SFTP - SSH File Transfer Protocol`
- Port: `22`
- Logon Type: `Normal`
- User: `root`
- Password: [sunucu şifreniz]

**Bağlan** butonuna tıklayın.

## 2. Dizinleri Hazırlayın

**Sol taraf (Local site):**
- `D:\cursor\stok-takip` dizinine gidin

**Sağ taraf (Remote site):**
- `/root/stok-takip` dizinine gidin

## 3. node_modules Klasörünü Yükleyin

**Yöntem 1: Sürükle-Bırak (Önerilen)**
1. Sol tarafta `node_modules` klasörünü bulun
2. Sağ tarafa sürükleyip bırakın
3. Transfer başlayacak (500MB+ olabilir, zaman alabilir)

**Yöntem 2: Sağ tıklayıp Upload**
1. Sol tarafta `node_modules` klasörüne sağ tıklayın
2. "Upload" seçeneğini seçin

## 4. Transfer Modunu Kontrol Edin

- Üst menüden: Transfer → Transfer type → Binary
- Bu önemli! Text modu hatalara neden olabilir.

## 5. Transfer Tamamlanana Kadar Bekleyin

- Alt kısımda transfer durumunu görebilirsiniz
- İlk yüklemede timeout olabilir, tekrar deneyin
- Transfer tamamlandığında sağ tarafta `node_modules` klasörü görünecek

## 6. Kontrol

Transfer tamamlandıktan sonra sunucuda kontrol edin:
```bash
cd /root/stok-takip
ls -la node_modules | head -5
```

## Sorun Giderme

**Timeout hatası:**
- FileZilla ayarlarından timeout süresini artırın
- Edit → Settings → Transfers → Timeout: 60 saniye

**Yavaş transfer:**
- Normal, node_modules büyük bir klasör
- Sabırla bekleyin

**Bağlantı hatası:**
- SSH portunun açık olduğundan emin olun
- Firewall ayarlarını kontrol edin

