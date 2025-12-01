# Sunucuda Build Sorunu

## Sorun
- Next.js SWC binary'si Linux için yok
- Windows'tan yüklenen node_modules Linux binary'lerini içermiyor
- Ağ bağlantısı olmadığı için binary indirilemiyor

## Çözüm: Windows'ta Build Yapın

### 1. Windows'ta Build
```powershell
cd D:\cursor\stok-takip
npm run build
```

### 2. .next Klasörünü Sunucuya Yükleyin
FileZilla ile:
- `D:\cursor\stok-takip\.next` → `/root/stok-takip/`

### 3. Sunucuda Başlatın
```bash
cd /root/stok-takip
npm start
```

## Alternatif: SWC Binary'sini Manuel İndirme (Ağ Sorunu Çözülünce)

```bash
cd /root/stok-takip
npm install @next/swc-linux-x64-gnu --save-dev
npm run build
```

## Not
Windows'ta build yapmak daha hızlı ve kolay. .next klasörü platform-bağımsız çalışır.

