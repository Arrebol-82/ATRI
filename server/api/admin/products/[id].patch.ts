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

function extractNewsAssetsFilename(imageUrl: string): string | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl || !imageUrl) return null;
  const prefix = `${supabaseUrl}/storage/v1/object/public/news-assets/`;
  if (!imageUrl.startsWith(prefix)) return null;
  return decodeURIComponent(imageUrl.slice(prefix.length));
}

async function tryDeleteOldImage(oldImageUrl: string): Promise<void> {
  const filename = extractNewsAssetsFilename(oldImageUrl);
  if (!filename) return;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  await supabase.storage.from("news-assets").remove([filename]).catch(() => {});
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing product id",
    });
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

  // 先查旧记录拿到旧图 URL
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

  // 更新成功后异步清理旧文件（仅删 news-assets bucket 中的文件）
  if (current.imageUrl !== imageUrl) {
    tryDeleteOldImage(current.imageUrl);
  }

  return updated;
});
