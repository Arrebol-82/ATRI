import { getPrismaClient } from "../../../utils/prisma";

type ProductCreateBody = {
  id: string;
  name: string;
  category: string;
  priceDisplay: string;
  imageDescription?: string | null;
  imageUrl: string;
  stock?: number;
  sortOrder?: number;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<ProductCreateBody>(event);

  const id = String(body.id ?? "").trim();
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const priceDisplay = String(body.priceDisplay ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const imageDescription = String(body.imageDescription ?? "").trim();
  const stock = Math.max(0, Math.floor(Number(body.stock) || 0));
  const sortOrder = Math.floor(Number(body.sortOrder) || 0);

  if (!id || !name || !category || !priceDisplay || !imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "商品 ID、名称、分类、价格和图片地址均为必填项",
    });
  }

  const prisma = await getPrismaClient();

  const existing = await prisma.merchandise.findUnique({ where: { id } });
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `商品 ID「${id}」已存在，请换一个`,
    });
  }

  return await prisma.merchandise.create({
    data: {
      id,
      name,
      category,
      priceDisplay,
      imageUrl,
      imageDescription,
      stock,
      sortOrder,
    },
  });
});
