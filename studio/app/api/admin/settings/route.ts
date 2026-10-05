import {
  admin,
  db,
  readJson,
  sameOrigin,
  apiError,
  HttpError,
} from "@/lib/server";
export async function PUT(req: Request) {
  try {
    sameOrigin(req);
    await admin();
    const p = await readJson(req);
    if (
      typeof p.enabled !== "boolean" ||
      typeof p.publishSeo !== "boolean" ||
      !["ko", "zh-TW"].includes(p.locale) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time)
    )
      throw new HttpError(400, "자동화 설정을 확인해 주세요.");
    const settings = {
      enabled: p.enabled,
      publishSeo: p.publishSeo,
      locale: p.locale,
      time: p.time,
    };
    await db()
      .prepare(
        "INSERT INTO settings (key,value) VALUES ('automation',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      )
      .bind(JSON.stringify(settings))
      .run();
    return Response.json({ settings });
  } catch (e) {
    return apiError(e);
  }
}
