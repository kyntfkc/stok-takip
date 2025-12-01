interface TelegramConfig {
  botToken: string
  chatId: string
}

interface TelegramMessage {
  text: string
  parseMode?: "HTML" | "Markdown" | "MarkdownV2"
}

class TelegramClient {
  private config: TelegramConfig | null = null

  constructor() {
    // Environment variables'dan config yükle
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      this.config = {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
      }
    }
  }

  isConfigured(): boolean {
    return this.config !== null
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    if (!this.config) {
      console.error("Telegram yapılandırması bulunamadı")
      return false
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: message.text,
          parse_mode: message.parseMode || "HTML",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Telegram mesaj gönderme hatası:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        return false
      }

      const data = await response.json()
      return data.ok === true
    } catch (error) {
      console.error("Telegram bağlantı hatası:", error)
      return false
    }
  }

  async getMe(): Promise<{ id: number; username: string; first_name: string } | null> {
    if (!this.config) {
      return null
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/getMe`
      
      const response = await fetch(url, {
        method: "GET",
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.ok ? data.result : null
    } catch (error) {
      console.error("Telegram bot bilgisi alma hatası:", error)
      return null
    }
  }
}

export const telegramClient = new TelegramClient()
export type { TelegramMessage, TelegramConfig }

