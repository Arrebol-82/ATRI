import { getPrismaClient } from '../../utils/prisma'

function toProductSummary(merchandise: any, saleStats?: any) {
  return {
    id: merchandise.id,
    name: merchandise.name,
    category: merchandise.category ?? 'Merch',
    priceDisplay: merchandise.priceDisplay ?? '',
    imageUrl: merchandise.imageUrl ?? '',
    stock: merchandise.stock ?? 0,
    soldQuantity: saleStats?._sum?.quantity ?? 0,
    orderCount: saleStats?._count?.id ?? 0,
    revenue: saleStats?._sum?.amount ?? 0
  }
}

export default defineEventHandler(async () => {
  const prisma = await getPrismaClient()

  const [orderTotal, orderAmountAggregate, visitTotal, saleGroups, allProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        amount: true
      }
    }),
    prisma.visit.count(),
    prisma.order.groupBy({
      by: ['merchandiseId'],
      _sum: {
        quantity: true,
        amount: true
      },
      _count: {
        id: true
      }
    }),
    prisma.merchandise.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        priceDisplay: true,
        imageUrl: true,
        stock: true
      }
    })
  ])

  const saleStatsMap = new Map(saleGroups.map((item: any) => [item.merchandiseId, item]))
  const productsWithSales = allProducts.map((product: any) =>
    toProductSummary(product, saleStatsMap.get(product.id))
  )
  const popularProducts = [...productsWithSales]
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .slice(0, 4)
  const salesProducts = [...productsWithSales]
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
  const slowProducts = [...productsWithSales]
    .sort((a, b) => a.soldQuantity - b.soldQuantity)
    .slice(0, 3)
  const productTotal = allProducts.length
  const categoryMap = new Map<string, { category: string, count: number }>()

  for (const product of allProducts) {
    const category = product.category ?? 'Merch'
    const current = categoryMap.get(category) ?? { category, count: 0 }
    current.count += 1
    categoryMap.set(category, current)
  }

  const categoryStats = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((item) => ({
      ...item,
      percentage: productTotal > 0 ? Math.round((item.count / productTotal) * 100) : 0
    }))

  const metrics = {
    revenue: orderAmountAggregate._sum.amount ?? 0,
    visits: visitTotal,
    orders: orderTotal,
    returns: 0
  }

  return {
    metrics,
    cards: [
      {
        key: 'revenue',
        title: '销售额',
        value: metrics.revenue,
        format: 'currency'
      },
      {
        key: 'visits',
        title: '访问量',
        value: metrics.visits,
        format: 'number'
      },
      {
        key: 'orders',
        title: '订单数',
        value: metrics.orders,
        format: 'number'
      },
      {
        key: 'returns',
        title: '退货数',
        value: metrics.returns,
        format: 'number'
      }
    ],
    popularProducts,
    salesProducts,
    slowProducts,
    categoryStats
  }
})
