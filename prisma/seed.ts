import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * 数据库连接配置
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = connectionString.startsWith("prisma+postgres://")
  ? new PrismaClient({ accelerateUrl: connectionString })
  : new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const BASE_URL =
  "https://irkydgphndgopzicgqou.supabase.co/storage/v1/object/public/atri/";

/**
 * 核心商品数据：基于 merchandise.get.ts 的“含税”版本对齐
 */
const merchandiseData = [
  {
    id: "fallback-ph-amiami",
    name: "3尺寸画布",
    category: "周边",
    priceDisplay: "JPY 14,000",
    imageDescription: "Canvas goods product image",
    imageUrl: `${BASE_URL}ph_amiami.webp`,
    sortOrder: 1,
  },
  {
    id: "fallback-ph-animate-1",
    name: "动画原创亚克力立牌",
    category: "亚克力立牌",
    priceDisplay: "JPY 3,300 (含税)",
    imageDescription: "Acrylic goods product image",
    imageUrl: `${BASE_URL}ph_animate_1.webp`,
    sortOrder: 2,
  },
  {
    id: "fallback-ph-animega-2",
    name: "动画原创插画 B2 挂毯",
    category: "海报",
    priceDisplay: "JPY 500 (含税)",
    imageDescription: "Poster goods product image",
    imageUrl: `${BASE_URL}ph_animega_2.webp`,
    sortOrder: 3,
  },
  {
    id: "fallback-ph-aniplex-2",
    name: "ATRI 亚克力商品",
    category: "亚克力立牌",
    priceDisplay: "JPY 28,000",
    imageDescription: "Official goods product image",
    imageUrl: `${BASE_URL}ph_aniplex_2.webp`,
    sortOrder: 4,
  },
  {
    id: "fallback-ph-gamers-2",
    name: "动画原创插画 B2 挂毯 Atori",
    category: "海报",
    priceDisplay: "JPY 3,900",
    imageDescription: "Tapestry goods product image",
    imageUrl: `${BASE_URL}ph_gamers_2.webp`,
    sortOrder: 5,
  },
  {
    id: "fallback-ph-joshin",
    name: "ATRI 钥匙扣",
    category: "挂件",
    priceDisplay: "JPY 300",
    imageDescription: "Keychain goods product image",
    imageUrl: `${BASE_URL}ph_joshin.webp`,
    sortOrder: 6,
  },
  {
    id: "fallback-ph-melonbooks",
    name: "B2 挂毯",
    category: "海报",
    priceDisplay: "JPY 18,000",
    imageDescription: "B2 tapestry goods product image",
    imageUrl: `${BASE_URL}ph_melonbooks.webp`,
    sortOrder: 7,
  },
  {
    id: "fallback-ph-rakuten-1",
    name: "原创插画 2L 角色精美画",
    category: "海报",
    priceDisplay: "JPY 2,500",
    imageDescription: "Character illustration goods product image",
    imageUrl: `${BASE_URL}ph_rakuten_1.webp`,
    sortOrder: 8,
  },
  {
    id: "fallback-ph-seven",
    name: "制图精细商品",
    category: "周边",
    priceDisplay: "JPY 1,000",
    imageDescription: "Official goods product image",
    imageUrl: `${BASE_URL}ph_seven.webp`,
    sortOrder: 9,
  },
  {
    id: "fallback-ph-toranoana",
    name: "明信片大小亚克力支架",
    category: "亚克力立牌",
    priceDisplay: "JPY 153,000",
    imageDescription: "Acrylic stand goods product image",
    imageUrl: `${BASE_URL}ph_toranoana.webp`,
    sortOrder: 10,
  },
  {
    id: "fallback-ph-tsutaya-1",
    name: "两张 L 尺寸银盐照片",
    category: "海报",
    priceDisplay: "JPY 5,500",
    imageDescription: "Photo goods product image",
    imageUrl: `${BASE_URL}ph_tsutaya_1.webp`,
    sortOrder: 11,
  },
  {
    id: "fallback-w",
    name: "动画原创 P3 角色美术画板",
    category: "海报",
    priceDisplay: "JPY 3,000",
    imageDescription: "Art board goods product image",
    imageUrl: `${BASE_URL}w.webp`,
    sortOrder: 12,
  },
];

/**
 * 执行同步逻辑
 */
async function main() {
  console.log("🚀 开始将本地“标准答案”同步至 Supabase 云端...");

  // 1. 清空当前数据库内容
  await prisma.merchandise.deleteMany();
  console.log("清理旧数据完成");

  // 2. 批量创建新数据
  await prisma.merchandise.createMany({
    data: merchandiseData.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      priceDisplay: item.priceDisplay,
      imageDescription: item.imageDescription,
      imageUrl: item.imageUrl,
      sortOrder: item.sortOrder, // 确保写入手动分配的排序序号
    })),
  });

  console.log("✅ 数据同步成功！云端现在已是“含税”且有序的版本。");
}

main()
  .catch((error) => {
    console.error("❌ 同步过程中发生错误:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
