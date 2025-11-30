import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")

  try {
    if (key) {
      const setting = await prisma.setting.findUnique({
        where: { key },
      })
      return NextResponse.json(setting?.value ? JSON.parse(setting.value) : null)
    }

    const settings = await prisma.setting.findMany()
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = JSON.parse(setting.value)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error("Ayarlar getirme hatası:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return new NextResponse("Missing key or value", { status: 400 })
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value: JSON.stringify(value),
      },
      create: {
        key,
        value: JSON.stringify(value),
      },
    })

    return NextResponse.json(JSON.parse(setting.value))
  } catch (error) {
    console.error("Ayar kaydetme hatası:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

