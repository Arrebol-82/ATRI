import { getPrismaClient } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, date, imageUrl, body: paragraphs, eventDate, eventPlace, eventContent, notes, sortOrder } = body;

  if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: "标题不能为空" });
  if (!date?.trim()) throw createError({ statusCode: 400, statusMessage: "日期不能为空" });
  if (!imageUrl?.trim()) throw createError({ statusCode: 400, statusMessage: "图片地址不能为空" });

  const prisma = await getPrismaClient();
  return await prisma.news.create({
    data: {
      title: title.trim(),
      date: date.trim(),
      imageUrl: imageUrl.trim(),
      body: Array.isArray(paragraphs) ? paragraphs : [],
      eventDate: eventDate?.trim() || null,
      eventPlace: eventPlace?.trim() || null,
      eventContent: eventContent?.trim() || null,
      notes: Array.isArray(notes) ? notes : [],
      sortOrder: Number(sortOrder) || 0,
    },
  });
});
