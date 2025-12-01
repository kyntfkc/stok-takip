import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basit health check - veritabanı bağlantısını kontrol et
    const { prisma } = await import("@/lib/prisma")
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

