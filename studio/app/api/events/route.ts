import { db, sameOrigin, readJson, apiError, HttpError } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const p = await readJson(req);
    if (
      !["page_view", "reading_complete"].includes(p.event) ||
      !["direct", "instagram", "threads", "google", "naver"].includes(
        p.source,
      ) ||
      !["ko", "zh-TW"].includes(p.locale)
    )
      throw new HttpError(400, "올바르지 않은 이벤트입니다.");
    const day = new Date().toISOString().slice(0, 10);
    await db()
      .prepare(
        "INSERT INTO event_totals (day,event,source,locale,count) VALUES (?,?,?,?,1) ON CONFLICT(day,event,source,locale) DO UPDATE SET count=count+1",
      )
      .bind(day, p.event, p.source, p.locale)
      .run();
    return new Response(null, { status: 204 });
  } catch (e) {
    return apiError(e);
  }
}
