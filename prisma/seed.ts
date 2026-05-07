import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = connectionString.startsWith('prisma+postgres://')
  ? new PrismaClient({ accelerateUrl: connectionString })
  : new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const BASE_URL = 'https://irkydgphndgopzicgqou.supabase.co/storage/v1/object/public/atri/'

const merchandiseData = [
  {
    name: '3尺寸画布',
    category: '周边',
    priceDisplay: 'JPY 14,000',
    imageDescription: 'Blu-ray 商品展示图',
    fileName: 'ph_amiami.webp'
  },
  {
    name: '动画原创亚克力立牌',
    category: '亚克力立牌',
    priceDisplay: 'JPY 3,300 tax included',
    imageDescription: 'Acrylic Panel 商品展示图',
    fileName: 'ph_animate_1.webp'
  },
  {
    name: '动画原创插画 B2 挂毯',
    category: '海报',
    priceDisplay: 'JPY 500 tax included',
    imageDescription: 'Clear File 商品展示图',
    fileName: 'ph_animega_2.webp'
  },
  {
    name: 'ATRI 亚克力商品',
    category: '周边',
    priceDisplay: 'JPY 28,000',
    imageDescription: 'Blu-ray 商品展示图',
    fileName: 'ph_aniplex_2.webp'
  },
  {
    name: '动画原创插画 B2 挂毯 Atori',
    category: '海报',
    priceDisplay: 'JPY 3,900',
    imageDescription: 'Acrylic Panel 商品展示图',
    fileName: 'ph_gamers_2.webp'
  },
  {
    name: 'ATRI 钥匙扣',
    category: '挂件',
    priceDisplay: 'JPY 300',
    imageDescription: 'Clear File 商品展示图',
    fileName: 'ph_joshin.webp'
  },
  {
    name: 'B2 挂毯',
    category: '海报',
    priceDisplay: 'JPY 18,000',
    imageDescription: 'Blu-ray 商品展示图',
    fileName: 'ph_melonbooks.webp'
  },
  {
    name: '原创插画 2L 角色精美画',
    category: '海报',
    priceDisplay: 'JPY 2,500',
    imageDescription: 'Acrylic Panel 商品展示图',
    fileName: 'ph_rakuten_1.webp'
  },
  {
    name: '制图精细图',
    category: '周边',
    priceDisplay: 'JPY 1,000',
    imageDescription: 'Clear File 商品展示图',
    fileName: 'ph_seven.webp'
  },
  {
    name: '明信片大小亚克力支架',
    category: '周边',
    priceDisplay: 'JPY 153,000',
    imageDescription: 'Blu-ray 商品展示图',
    fileName: 'ph_toranoana.webp'
  },
  {
    name: '两张 L 尺寸银盐照片',
    category: '海报',
    priceDisplay: 'JPY 5,500',
    imageDescription: 'Acrylic Panel 商品展示图',
    fileName: 'ph_tsutaya_1.webp'
  },
  {
    name: '动画原创 P3 角色美术画板',
    category: '海报',
    priceDisplay: 'JPY 3,000',
    imageDescription: 'Clear File 商品展示图',
    fileName: 'w.webp'
  }
]

async function main() {
  console.log('开始导入商品数据...')

  await prisma.merchandise.deleteMany()

  await prisma.merchandise.createMany({
    data: merchandiseData.map((item) => ({
      name: item.name,
      category: item.category,
      priceDisplay: item.priceDisplay,
      imageDescription: item.imageDescription,
      imageUrl: `${BASE_URL}${item.fileName}`
    }))
  })

  console.log('数据导入成功')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
