/**
 * 迁移脚本：为 atri bucket 下的旧图片 URL 批量添加 commodity/ 前缀
 *
 * 运行方式：
 *   npx tsx prisma/scripts/migrate-commodity-prefix.ts
 *
 * 前提：根目录 .env 中配置了 DATABASE_URL 和 SUPABASE_URL
 */

import * as fs from "fs";
import * as path from "path";

// 手动加载 .env（不依赖 dotenv 包）
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL 未配置");

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) throw new Error("SUPABASE_URL 未配置");

  // 初始化 Prisma（与 server/utils/prisma.ts 保持一致的双模式连接）
  const { PrismaClient } = await import("@prisma/client");
  let prisma: InstanceType<typeof PrismaClient>;

  if (connectionString.startsWith("prisma+postgres://")) {
    prisma = new PrismaClient({ datasourceUrl: connectionString } as any);
  } else {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    } as any);
  }

  const ATRI_PREFIX = `${supabaseUrl}/storage/v1/object/public/atri/`;
  const COMMODITY_PREFIX = `${ATRI_PREFIX}commodity/`;

  const products = await prisma.merchandise.findMany({
    select: { id: true, name: true, imageUrl: true },
  });

  console.log(`\n共检索到 ${products.length} 条商品记录\n${"─".repeat(60)}`);

  let updated = 0;
  let alreadyOk = 0;
  let skipped = 0;

  for (const product of products) {
    const url: string = product.imageUrl;

    // 已包含 commodity/ 前缀 → 跳过
    if (url.startsWith(COMMODITY_PREFIX)) {
      alreadyOk++;
      continue;
    }

    // atri bucket 根目录 URL → 需要添加 commodity/ 前缀
    if (url.startsWith(ATRI_PREFIX)) {
      const filename = url.slice(ATRI_PREFIX.length);
      const newUrl = `${COMMODITY_PREFIX}${filename}`;

      await prisma.merchandise.update({
        where: { id: product.id },
        data: { imageUrl: newUrl },
      });

      console.log(`✓ ${product.name}`);
      console.log(`  旧: ${url}`);
      console.log(`  新: ${newUrl}\n`);
      updated++;
      continue;
    }

    // 外部 URL 或其他 bucket → 跳过并提示
    console.log(`⚠ 跳过（非 atri bucket）: ${product.name}`);
    console.log(`  URL: ${url}\n`);
    skipped++;
  }

  console.log("─".repeat(60));
  console.log(`✅ 迁移完成`);
  console.log(`   已更新：${updated} 条`);
  console.log(`   已是最新：${alreadyOk} 条`);
  console.log(`   跳过（外部/其他）：${skipped} 条`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ 迁移失败：", err.message);
  process.exit(1);
});
