import { getPrismaClient } from "../utils/prisma";

export default defineEventHandler(async () => {
  const prisma = await getPrismaClient();

  return await prisma.news.findMany({
    orderBy: { sortOrder: "asc" },
  });
});
