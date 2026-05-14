import { getPrismaClient } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const prisma = await getPrismaClient()

  const [
    productTotal,
    stockAggregate,
    categoryGroups,
    categoryTotal,
    orderTotal,
    orderAmountAggregate,
    orderStatusGroups,
    visitTotal
  ] = await Promise.all([
    prisma.merchandise.count(),
    prisma.merchandise.aggregate({
      _sum: {
        stock: true
      }
    }),
    prisma.merchandise.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      _sum: {
        stock: true
      },
      orderBy: {
        category: 'asc'
      }
    }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        amount: true,
        quantity: true
      }
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      _sum: {
        amount: true,
        quantity: true
      },
      orderBy: {
        status: 'asc'
      }
    }),
    prisma.visit.count()
  ])

  const products = {
    total: productTotal,
    stockTotal: stockAggregate._sum.stock ?? 0,
    definedCategoryTotal: categoryTotal,
    categoryStats: categoryGroups.map((item: any) => {
      const count = item._count.category

      return {
        category: item.category,
        count,
        stockTotal: item._sum.stock ?? 0,
        percentage: productTotal > 0 ? Number(((count / productTotal) * 100).toFixed(2)) : 0
      }
    })
  }

  const orders = {
    total: orderTotal,
    revenue: orderAmountAggregate._sum.amount ?? 0,
    quantityTotal: orderAmountAggregate._sum.quantity ?? 0,
    statusStats: orderStatusGroups.map((item: any) => {
      const count = item._count.status

      return {
        status: item.status,
        count,
        amount: item._sum.amount ?? 0,
        quantity: item._sum.quantity ?? 0,
        percentage: orderTotal > 0 ? Number(((count / orderTotal) * 100).toFixed(2)) : 0
      }
    })
  }

  return {
    products,
    orders,
    visits: {
      total: visitTotal
    }
  }
})
