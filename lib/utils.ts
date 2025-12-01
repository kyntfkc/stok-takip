import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock görsel URL'leri oluştur (Unsplash veya placeholder)
export function getProductImageUrl(productName: string, sku: string): string {
  // Ürün adına göre görsel seç
  const imageMap: Record<string, string> = {
    "Altın Yüzük": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop",
    "Gümüş Kolye": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    "Altın Küpe": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    "Gümüş Bilezik": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
    "Altın Bilezik": "https://images.unsplash.com/photo-1611955167811-4711904bb9f0?w=400&h=400&fit=crop",
    "Gümüş Yüzük": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
    "Altın Kolye": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    "Gümüş Küpe": "https://images.unsplash.com/photo-1611955167811-4711904bb9f0?w=400&h=400&fit=crop",
  }

  // Eğer haritada varsa kullan, yoksa SKU'ya göre placeholder oluştur
  if (imageMap[productName]) {
    return imageMap[productName]
  }

  // Placeholder görsel (SKU'ya göre renk değişir)
  const colors = ["FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8", "F7DC6F", "BB8FCE", "85C1E2"]
  const colorIndex = sku.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return `https://via.placeholder.com/400x400/${colors[colorIndex]}/FFFFFF?text=${encodeURIComponent(productName)}`
}