let prisma: any = null

export async function getPrismaClient() {
  if (prisma) {
    return prisma
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL is not set'
    })
  }

  const { PrismaClient } = await import('@prisma/client')
  const { PrismaPg } = await import('@prisma/adapter-pg')

  prisma = connectionString.startsWith('prisma+postgres://')
    ? new PrismaClient({ accelerateUrl: connectionString })
    : new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

  return prisma
}
