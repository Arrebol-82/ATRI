import { createClient } from "@supabase/supabase-js";
import { getPrismaClient } from "../../../utils/prisma";

type ProductUpdateBody = {
  name?: string;
  category?: string;
  priceDisplay?: string;
  imageDescription?: string | null;
  imageUrl?: string;
  stock?: number;
  sortOrder?: number;
};

type StorageFile = { bucket: string; path: string };

function extractStorageFile(imageUrl: string): StorageFile | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl || !imageUrl) return null;

  // 当前：atri bucket / commodity/ 文件夹
  const atriCommodityPrefix = `${supabaseUrl}/storage/v1/object/public/atri/commodity/`;
  if (imageUrl.startsWith(atriCommodityPrefix)) {
    return {
      bucket: "atri",
      path: `commodity/${decodeURIComponent(imageUrl.slice(atriCommodityPrefix.length))}`,
    };
  }

  // 兼容旧版：news-assets bucket（迁移前上传的文件）
  const newsAssetsPrefix = `${supabaseUrl}/storage/v1/object/public/news-assets/`;
  if (imageUrl.startsWith(newsAssetsPrefix)) {
    return {
      bucket: "news-assets",
      path: decodeURIComponent(imageUrl.slice(newsAssetsPrefix.length)),
    };
  }

  return null; // 外部 URL 或 atri 根目录旧资产，不删除
}

async function tryDeleteOldImage(oldImageUrl: string): Promise<void> {
  const file = extractStorageFile(oldImageUrl);
  if (!file) return;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  await supabase.storage.from(file.bucket).remove([file.path]).catch(() => {});
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing product id" });
  }

  const body = await readBody<ProductUpdateBody>(event);

  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const priceDisplay = String(body.priceDisplay ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const imageDescription = String(body.imageDescription ?? "").trim();
  const stock = Math.max(0, Math.floor(Number(body.stock) || 0));
  const sortOrder = Math.floor(Number(body.sortOrder) || 0);

  if (!name || !category || !priceDisplay || !imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product name, category, price and image URL are required",
    });
  }

  const prisma = await getPrismaClient();

  const current = await prisma.merchandise.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: "商品不存在" });
  }

  const updated = await prisma.merchandise.update({
    where: { id },
    data: { name, category, priceDisplay, imageUrl, imageDescription, stock, sortOrder },
  });

  // 异步清理旧文件（仅删除 atri/commodity/ 和 news-assets 中的托管资产）
  if (current.imageUrl !== imageUrl) {
    tryDeleteOldImage(current.imageUrl);
  }

  return updated;
});
