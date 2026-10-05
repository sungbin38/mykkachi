import {
  admin,
  sameOrigin,
  readJson,
  apiError,
  db,
  HttpError,
} from "@/lib/server";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(req);
    await admin();
    const { id } = await params;
    const p = await readJson(req);
    const row = await db()
      .prepare("SELECT * FROM content WHERE id=?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!row) throw new HttpError(404, "콘텐츠를 찾지 못했어요.");
    if (row.updated_at !== p.updatedAt)
      throw new HttpError(
        409,
        "다른 곳에서 수정된 콘텐츠입니다. 새로고침 후 확인해 주세요.",
      );
    if (
      typeof p.title !== "string" ||
      p.title.length < 3 ||
      p.title.length > 150 ||
      typeof p.body !== "string" ||
      p.body.length < 10 ||
      p.body.length > 18000 ||
      typeof p.excerpt !== "string" ||
      p.excerpt.length > 300
    )
      throw new HttpError(400, "제목·본문·설명을 확인해 주세요.");
    const statuses = ["draft", "approved", "scheduled", "published"];
    if (!statuses.includes(p.status))
      throw new HttpError(400, "상태가 올바르지 않습니다.");
    if (p.status === "published" && row.channel !== "seo")
      throw new HttpError(
        409,
        "SNS 계정이 연결되지 않았습니다. 검토 완료 후 파일 또는 문구를 내보내 주세요.",
      );
    if (p.status === "scheduled" && row.channel !== "seo")
      throw new HttpError(409, "현재 예약 발행은 SEO 저널만 지원합니다.");
    if (
      ["published", "scheduled"].includes(p.status) &&
      !["approved", "scheduled", "published"].includes(String(row.status))
    )
      throw new HttpError(409, "내용을 검토 완료한 다음 발행해 주세요.");
    if (
      ["published", "scheduled"].includes(p.status) &&
      (p.title !== row.title ||
        p.body !== row.body ||
        p.excerpt !== row.excerpt)
    )
      throw new HttpError(409, "수정된 내용은 다시 검토 완료해 주세요.");
    const edited =
      p.title !== row.title ||
      p.body !== row.body ||
      p.excerpt !== row.excerpt ||
      JSON.stringify(p.slides) !== row.slides;
    let status = p.status;
    if (edited && status !== "approved") status = "draft";
    let scheduled: string | null = null;
    if (status === "scheduled") {
      if (
        typeof p.scheduledAt !== "string" ||
        !Number.isFinite(Date.parse(p.scheduledAt)) ||
        Date.parse(p.scheduledAt) <= Date.now()
      )
        throw new HttpError(400, "미래 예약 시간을 입력해 주세요.");
      scheduled = new Date(p.scheduledAt).toISOString();
    }
    if (
      !Array.isArray(p.slides) ||
      p.slides.length > 10 ||
      p.slides.some(
        (s: Record<string, unknown>) =>
          !s ||
          typeof s.title !== "string" ||
          s.title.length > 150 ||
          typeof s.body !== "string" ||
          s.body.length > 600 ||
          typeof s.label !== "string" ||
          typeof s.footer !== "string",
      )
    )
      throw new HttpError(400, "카드 문구를 확인해 주세요.");
    const updatedAt = new Date().toISOString();
    const result = await db()
      .prepare(
        "UPDATE content SET title=?,body=?,excerpt=?,slides=?,status=?,scheduled_at=?,updated_at=?,published_snapshot=CASE WHEN ?='published' THEN ? ELSE published_snapshot END,published_at=CASE WHEN ?='published' THEN ? ELSE published_at END WHERE id=? AND updated_at=?",
      )
      .bind(
        p.title,
        p.body,
        p.excerpt,
        JSON.stringify(p.slides),
        status,
        scheduled,
        updatedAt,
        status,
        JSON.stringify({ title: p.title, body: p.body, excerpt: p.excerpt }),
        status,
        updatedAt,
        id,
        p.updatedAt,
      )
      .run();
    if (!result.meta.changes)
      throw new HttpError(409, "콘텐츠가 변경되었습니다. 다시 불러와 주세요.");
    return Response.json({
      ok: true,
      updatedAt,
      status,
      scheduledAt: scheduled,
    });
  } catch (e) {
    return apiError(e);
  }
}
