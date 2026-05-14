import { getPrismaClient } from "../utils/prisma";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", async (_html, { event }) => {
    const path = event.path;

    const isStatic = path.includes(".");
    const isAdmin = path.startsWith("/admin");
    const isApi = path.startsWith("/api");

    if (isStatic || isAdmin || isApi) {
      return;
    }

    try {
      const prisma = await getPrismaClient();

      await prisma.visit.create({
        data: { path },
      });
    } catch (error) {
      console.error("访问数据写入失败:", error);
    }
  });
});
