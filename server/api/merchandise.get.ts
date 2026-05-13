let prisma: any = null;

const BASE_URL =
  "https://irkydgphndgopzicgqou.supabase.co/storage/v1/object/public/atri/";

const fallbackMerchandise = [
  {
    id: "fallback-ph-amiami",
    name: "3尺寸画布",
    category: "周边",
    priceDisplay: "JPY 14,000",
    imageDescription: "Canvas goods product image",
    imageUrl: `${BASE_URL}ph_amiami.webp`,
    createdAt: new Date("2024-02-23T00:00:00.000Z"),
  },
  {
    id: "fallback-ph-animate-1",
    name: "动画原创亚克力立牌",
    category: "亚克力立牌",
    priceDisplay: "JPY 3,300 (含税)",
    imageDescription: "Acrylic goods product image",
    imageUrl: `${BASE_URL}ph_animate_1.webp`,
    createdAt: new Date("2024-02-23T00:00:01.000Z"),
  },
  {
    id: "fallback-ph-animega-2",
    name: "动画原创插画 B2 挂毯",
    category: "海报",
    priceDisplay: "JPY 500 (含税)",
    imageDescription: "Poster goods product image",
    imageUrl: `${BASE_URL}ph_animega_2.webp`,
    createdAt: new Date("2024-02-23T00:00:02.000Z"),
  },
  {
    id: "fallback-ph-aniplex-2",
    name: "ATRI 亚克力商品",
    category: "亚克力立牌",
    priceDisplay: "JPY 28,000",
    imageDescription: "Official goods product image",
    imageUrl: `${BASE_URL}ph_aniplex_2.webp`,
    createdAt: new Date("2024-02-23T00:00:03.000Z"),
  },
  {
    id: "fallback-ph-gamers-2",
    name: "动画原创插画 B2 挂毯 Atori",
    category: "海报",
    priceDisplay: "JPY 3,900",
    imageDescription: "Tapestry goods product image",
    imageUrl: `${BASE_URL}ph_gamers_2.webp`,
    createdAt: new Date("2024-02-23T00:00:04.000Z"),
  },
  {
    id: "fallback-ph-joshin",
    name: "ATRI 钥匙扣",
    category: "挂件",
    priceDisplay: "JPY 300",
    imageDescription: "Keychain goods product image",
    imageUrl: `${BASE_URL}ph_joshin.webp`,
    createdAt: new Date("2024-02-23T00:00:05.000Z"),
  },
  {
    id: "fallback-ph-melonbooks",
    name: "B2 挂毯",
    category: "海报",
    priceDisplay: "JPY 18,000",
    imageDescription: "B2 tapestry goods product image",
    imageUrl: `${BASE_URL}ph_melonbooks.webp`,
    createdAt: new Date("2024-02-23T00:00:06.000Z"),
  },
  {
    id: "fallback-ph-rakuten-1",
    name: "原创插画 2L 角色精美画",
    category: "海报",
    priceDisplay: "JPY 2,500",
    imageDescription: "Character illustration goods product image",
    imageUrl: `${BASE_URL}ph_rakuten_1.webp`,
    createdAt: new Date("2024-02-23T00:00:07.000Z"),
  },
  {
    id: "fallback-ph-seven",
    name: "制图精细商品",
    category: "周边",
    priceDisplay: "JPY 1,000",
    imageDescription: "Official goods product image",
    imageUrl: `${BASE_URL}ph_seven.webp`,
    createdAt: new Date("2024-02-23T00:00:08.000Z"),
  },
  {
    id: "fallback-ph-toranoana",
    name: "明信片大小亚克力支架",
    category: "亚克力立牌",
    priceDisplay: "JPY 153,000",
    imageDescription: "Acrylic stand goods product image",
    imageUrl: `${BASE_URL}ph_toranoana.webp`,
    createdAt: new Date("2024-02-23T00:00:09.000Z"),
  },
  {
    id: "fallback-ph-tsutaya-1",
    name: "两张 L 尺寸银盐照片",
    category: "海报",
    priceDisplay: "JPY 5,500",
    imageDescription: "Photo goods product image",
    imageUrl: `${BASE_URL}ph_tsutaya_1.webp`,
    createdAt: new Date("2024-02-23T00:00:10.000Z"),
  },
  {
    id: "fallback-w",
    name: "动画原创 P3 角色美术画板",
    category: "海报",
    priceDisplay: "JPY 3,000",
    imageDescription: "Art board goods product image",
    imageUrl: `${BASE_URL}w.webp`,
    createdAt: new Date("2024-02-23T00:00:11.000Z"),
  },
];

async function getPrismaClient() {
  if (prisma) {
    return prisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw createError({
      statusCode: 500,
      statusMessage: "DATABASE_URL is not set",
    });
  }

  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  prisma = connectionString.startsWith("prisma+postgres://")
    ? new PrismaClient({ accelerateUrl: connectionString })
    : new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  return prisma;
}

// ... 前面的 getPrismaClient 等代码保持不变 ...

export default defineEventHandler(async () => {
  try {
    const prisma = await getPrismaClient();
    return await prisma.merchandise.findMany({
      // 🚀 修改排序逻辑
      orderBy: [
        { sortOrder: "asc" }, // 首先按自定义序号排
        { createdAt: "asc" }, // 序号相同时，按创建时间排
      ],
    });
  } catch (error) {
    console.error("数据库查询失败:", error);
    // 如果失败，返回 fallback 数据（建议也给 fallback 数据加上 sortOrder 属性）
    return fallbackMerchandise;
  }
});
