import { getPrismaClient } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string; order?: number }>(event);
  const name = String(body.name ?? "").trim();

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "分类名称不能为空" });
  }

  const prisma = await getPrismaClient();

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: `分类「${name}」已存在` });
  }

  const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
  const order = (last?.order ?? 0) + 1;

  return await prisma.category.create({ data: { name, order } });
});
