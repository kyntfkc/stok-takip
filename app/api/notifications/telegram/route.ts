import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { telegramClient } from "@/lib/telegram"
import { checkAllLowStockProducts } from "@/lib/notifications/telegram"
import { z } from "zod"

const messageSchema = z.object({
  text: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    if (!telegramClient.isConfigured()) {
      return NextResponse.json(
        { error: "Telegram yapılandırılmamış" },
        { status: 400 }
      )
    }

    const success = await telegramClient.sendMessage({
      text: validatedData.text,
      parseMode: "HTML",
    })

    if (!success) {
      return NextResponse.json(
        { error: "Mesaj gönderilemedi" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Telegram mesaj gönderme hatası:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Bot bilgisini kontrol et
    const botInfo = await telegramClient.getMe()
    
    if (!botInfo) {
      return NextResponse.json(
        { error: "Telegram bot bağlantısı başarısız" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        name: botInfo.first_name,
      },
    })
  } catch (error) {
    console.error("Telegram bot bilgisi alma hatası:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

