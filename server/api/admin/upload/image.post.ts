import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw createError({ statusCode: 500, statusMessage: "Supabase 配置缺失" });
  }

  const parts = await readMultipartFormData(event);
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: "未收到文件" });
  }

  const filePart = parts.find((p) => p.name === "file");
  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: "文件字段无效" });
  }

  const mimeType = filePart.type ?? "image/jpeg";
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: "仅支持 JPG / PNG / WebP / GIF / AVIF 格式" });
  }

  const safeName = filePart.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabase.storage
    .from("news-assets")
    .upload(filename, filePart.data, { contentType: mimeType, upsert: false });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: `上传失败：${error.message}` });
  }

  const { data } = supabase.storage.from("news-assets").getPublicUrl(filename);

  return { url: data.publicUrl };
});
