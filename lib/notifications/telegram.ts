import { telegramClient } from "@/lib/telegram"
import { prisma } from "@/lib/prisma"

interface LowStockProduct {
  id: string
  name: string
  sku: string
  currentStock: number
}

const LOW_STOCK_THRESHOLD = 10

/**
 * Düşük stok bildirimi gönder
 */
export async function sendLowStockNotification(product: LowStockProduct): Promise<boolean> {
  if (!telegramClient.isConfigured()) {
    console.log("Telegram yapılandırılmamış, bildirim gönderilmiyor")
    return false
  }

  if (product.currentStock > LOW_STOCK_THRESHOLD) {
    return false
  }

  const statusEmoji = product.currentStock === 0 ? "🔴" : "🟠"
  const statusText = product.currentStock === 0 ? "Tükendi" : "Kritik Seviye"

  const message = `⚠️ <b>Düşük Stok Uyarısı</b>

<b>Ürün:</b> ${escapeHtml(product.name)}
<b>SKU:</b> <code>${escapeHtml(product.sku)}</code>
<b>Mevcut Stok:</b> ${product.currentStock} adet
<b>Durum:</b> ${statusEmoji} ${statusText}`

  return await telegramClient.sendMessage({
    text: message,
    parseMode: "HTML",
  })
}

/**
 * Stok işlemi sonrası düşük stok kontrolü yap ve bildirim gönder
 */
export async function checkAndNotifyLowStock(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
      },
    })

    if (!product) {
      return
    }

    // Düşük stok kontrolü
    if (product.currentStock <= LOW_STOCK_THRESHOLD) {
      await sendLowStockNotification(product)
    }
  } catch (error) {
    console.error("Düşük stok kontrolü hatası:", error)
  }
}

/**
 * Tüm düşük stoklu ürünleri kontrol et ve bildirim gönder
 */
export async function checkAllLowStockProducts(): Promise<void> {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: LOW_STOCK_THRESHOLD,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
      },
    })

    if (lowStockProducts.length === 0) {
      return
    }

    // Her ürün için bildirim gönder
    for (const product of lowStockProducts) {
      await sendLowStockNotification(product)
      // Rate limiting için kısa bir bekleme
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  } catch (error) {
    console.error("Düşük stok kontrolü hatası:", error)
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

