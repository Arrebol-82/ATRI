import { getPrismaClient } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "缺少 ID" });

  const prisma = await getPrismaClient();

  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) throw createError({ statusCode: 404, statusMessage: "新闻不存在" });

  await prisma.news.delete({ where: { id } });
  return { success: true };
});
