import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { email, username, password, name, role } = body

    if (!email || !username || !role) {
      return NextResponse.json(
        { error: "Email, username ve role gereklidir" },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Email ve username kontrolü (kendisi hariç)
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { email },
              { username },
            ],
          },
        ],
      },
    })

    if (duplicateUser) {
      return NextResponse.json(
        { error: "Bu email veya kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Şifre güncelleniyorsa hashle
    const updateData: any = {
      email,
      username,
      name: name || null,
      role,
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Kendi hesabını silmeyi engelle
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}

