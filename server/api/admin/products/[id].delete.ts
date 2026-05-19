import { getPrismaClient } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing product id",
    });
  }

  const prisma = await getPrismaClient();

  try {
    return await prisma.merchandise.delete({
      where: { id },
    });
  } catch (error: any) {
    if (error?.code === "P2003") {
      throw createError({
        statusCode: 409,
        statusMessage: "商品已有订单记录，不能直接删除",
      });
    }

    throw error;
  }
});
