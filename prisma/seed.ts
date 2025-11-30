// @ts-ignore - Prisma Client v7 import
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import QRCode from "qrcode"

// Role enum değerleri
const Role = {
  ADMIN: "ADMIN",
  OPERATION: "OPERATION",
  WORKSHOP: "WORKSHOP",
} as const

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Kullanıcılar oluştur
  const adminPassword = await bcrypt.hash("admin123", 10)
  const operationPassword = await bcrypt.hash("operation123", 10)
  const workshopPassword = await bcrypt.hash("workshop123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@indigo.com" },
    update: {},
    create: {
      email: "admin@indigo.com",
      username: "admin",
      password: adminPassword,
      name: "Yönetici",
      role: Role.ADMIN,
    },
  })

  const operation = await prisma.user.upsert({
    where: { email: "operation@indigo.com" },
    update: {},
    create: {
      email: "operation@indigo.com",
      username: "operation",
      password: operationPassword,
      name: "Operasyon",
      role: Role.OPERATION,
    },
  })

  const workshop = await prisma.user.upsert({
    where: { email: "workshop@indigo.com" },
    update: {},
    create: {
      email: "workshop@indigo.com",
      username: "workshop",
      password: workshopPassword,
      name: "Atölye",
      role: Role.WORKSHOP,
    },
  })

  console.log("Users created:", { admin, operation, workshop })

  // Ürünler oluştur
  const products = [
    { name: "Altın Yüzük", sku: "ALT-YZK-001", weight: 5.5, stock: 25 },
    { name: "Gümüş Kolye", sku: "GUM-KLY-001", weight: 12.3, stock: 15 },
    { name: "Altın Küpe", sku: "ALT-KPE-001", weight: 3.2, stock: 30 },
    { name: "Gümüş Bilezik", sku: "GUM-BLZ-001", weight: 18.7, stock: 20 },
    { name: "Altın Bilezik", sku: "ALT-BLZ-001", weight: 22.1, stock: 10 },
    { name: "Gümüş Yüzük", sku: "GUM-YZK-001", weight: 4.8, stock: 18 },
    { name: "Altın Kolye", sku: "ALT-KLY-001", weight: 15.5, stock: 12 },
    { name: "Gümüş Küpe", sku: "GUM-KPE-001", weight: 2.9, stock: 28 },
  ]

  const createdProducts = []
  for (const product of products) {
    const qrCodeData = JSON.stringify({
      type: "product",
      sku: product.sku,
    })
    const qrCode = await QRCode.toDataURL(qrCodeData)

    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        name: product.name,
        sku: product.sku,
        weight: product.weight,
        currentStock: product.stock,
        qrCode: qrCode,
      },
    })
    createdProducts.push(created)
  }

  console.log("Products created:", createdProducts.length)

  // Örnek siparişler oluştur
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-001`,
      customerName: "Örnek Müşteri 1",
      status: "NEW",
      userId: operation.id,
      orderItems: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 2,
            status: "TO_PRODUCE",
          },
          {
            productId: createdProducts[1].id,
            quantity: 1,
            status: "TO_PRODUCE",
          },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-002`,
      customerName: "Örnek Müşteri 2",
      status: "IN_PRODUCTION",
      userId: operation.id,
      orderItems: {
        create: [
          {
            productId: createdProducts[2].id,
            quantity: 3,
            status: "WAX_PRESSING",
          },
        ],
      },
    },
  })

  const order3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-003`,
      customerName: "Örnek Müşteri 3",
      status: "COMPLETED",
      completedAt: new Date(),
      userId: operation.id,
      orderItems: {
        create: [
          {
            productId: createdProducts[3].id,
            quantity: 1,
            status: "COMPLETED",
          },
        ],
      },
    },
  })

  console.log("Orders created:", { order1, order2, order3 })

  // Örnek stok hareketleri
  await prisma.stockTransaction.create({
    data: {
      productId: createdProducts[0].id,
      type: "IN",
      quantity: 10,
      reason: "İlk stok girişi",
      userId: admin.id,
    },
  })

  await prisma.stockTransaction.create({
    data: {
      productId: createdProducts[1].id,
      type: "OUT",
      quantity: 5,
      reason: "Satış",
      userId: operation.id,
    },
  })

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

