import { getPrismaClient } from '../../utils/prisma'

const ORDER_STATUS = {
  PENDING: '待处理',
  SHIPPED: '已发货',
  CANCELLED: '已取消'
} as const

const CHINA_UTC_OFFSET_MS = 8 * 60 * 60 * 1000

function parsePriceAmount(priceDisplay: string) {
  const amount = Number(String(priceDisplay ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function getChinaUtcDate() {
  return new Date(Date.now() + CHINA_UTC_OFFSET_MS)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const merchandiseId = String(body.merchandiseId ?? '').trim()
  const customerName = String(body.name ?? '').trim()
  const deliveryAddress = String(body.address ?? '').trim()
  const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1))

  if (!merchandiseId || !customerName || !deliveryAddress) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required order fields'
    })
  }

  const prisma = await getPrismaClient()
  const merchandise = await prisma.merchandise.findUnique({
    where: { id: merchandiseId }
  })

  if (!merchandise) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Merchandise not found'
    })
  }

  if (Number(merchandise.stock) < quantity) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Insufficient stock'
    })
  }

  const unitAmount = parsePriceAmount(merchandise.priceDisplay)
  const amount = unitAmount * quantity

  const result = await prisma.$transaction(async (tx: any) => {
    const stockUpdate = await tx.merchandise.updateMany({
      where: {
        id: merchandiseId,
        stock: {
          gte: quantity
        }
      },
      data: {
        stock: {
          decrement: quantity
        }
      }
    })

    if (stockUpdate.count !== 1) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Insufficient stock'
      })
    }

    const order = await tx.order.create({
      data: {
        merchandiseId,
        productName: merchandise.name,
        category: merchandise.category || 'Merch',
        quantity,
        amount,
        customerInfo: `姓名: ${customerName} | 地址: ${deliveryAddress}`,
        status: ORDER_STATUS.PENDING,
        createdAt: getChinaUtcDate()
      }
    })

    const updatedMerchandise = await tx.merchandise.findUnique({
      where: { id: merchandiseId },
      select: {
        id: true,
        stock: true
      }
    })

    return {
      order,
      merchandise: updatedMerchandise
    }
  })

  return {
    success: true,
    order: result.order,
    merchandise: result.merchandise
  }
})
