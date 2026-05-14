import { getPrismaClient } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing order id" });
  }

  const body = await readBody<{ status: string }>(event);
  if (!body?.status) {
    throw createError({ statusCode: 400, statusMessage: "Missing status" });
  }

  const prisma = await getPrismaClient();
  return await prisma.order.update({
    where: { id },
    data: { status: body.status },
  });
});
