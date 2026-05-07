import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = connectionString.startsWith('prisma+postgres://')
  ? new PrismaClient({ accelerateUrl: connectionString })
  : new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

export default defineEventHandler(async () => {
  try {
    return await prisma.merchandise.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })
  } catch (error) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load merchandise data'
    })
  }
})
