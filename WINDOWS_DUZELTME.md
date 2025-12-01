# Windows'ta Dosya Düzeltme

## Yöntem 1: FileZilla ile Sunucudan İndirin

1. FileZilla'da sunucuya bağlanın
2. Sağ tarafta: `/root/stok-takip/app/api/users/[id]/route.ts`
3. Sol tarafa sürükleyip bırakın (üzerine yazın)
4. Dosya güncellenecek

## Yöntem 2: Manuel Düzeltme

`D:\cursor\stok-takip\app\api\users\[id]\route.ts` dosyasını açın ve şu değişiklikleri yapın:

### Satır 8'i değiştirin:
**Eski:**
```typescript
{ params }: { params: { id: string } }
```

**Yeni:**
```typescript
{ params }: { params: Promise<{ id: string }> }
```

### Satır 20'yi değiştirin:
**Eski:**
```typescript
const { id } = params
```

**Yeni:**
```typescript
const { id } = await params
```

### Satır 103'ü değiştirin:
**Eski:**
```typescript
{ params }: { params: { id: string } }
```

**Yeni:**
```typescript
{ params }: { params: Promise<{ id: string }> }
```

### Satır 115'i değiştirin:
**Eski:**
```typescript
const { id } = params
```

**Yeni:**
```typescript
const { id } = await params
```

## Yöntem 3: GitHub'a Push/Pull

Eğer Git kullanıyorsanız:
```powershell
cd D:\cursor\stok-takip
git pull origin main
# veya
git pull origin master
```

