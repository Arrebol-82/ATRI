// server/api/merchandise.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 冷静理智地从数据库抓取所有商品，并按创建时间排序
    const products = await prisma.merchandise.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })
    return products
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '数据库连接失败',
    })
  }
})