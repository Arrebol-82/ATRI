import { getPrismaClient } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order id",
    });
  }

  const prisma = await getPrismaClient();

  return await prisma.order.delete({
    where: { id },
  });
});
