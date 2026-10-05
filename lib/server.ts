import "server-only";
import { db } from "./db";
import { generatePackage, type ContentItem } from "./content";
import { TOPICS } from "./knowledge";
import type { Locale } from "./brand";
export const runtime = () => process.env;
export { db };
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function admin() {
  const { hasAdminSession } = await import("./admin-auth");
  if (!(await hasAdminSession()))
    throw new HttpError(401, "관리자 로그인이 필요합니다.");
  return { displayName: "운영자" };
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin || origin !== new URL(req.url).origin)
    throw new HttpError(403, "다른 사이트에서 보낸 요청은 처리할 수 없습니다.");
}
export async function readJson(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "JSON 요청만 지원합니다.");
  const text = await req.text();
  if (text.length > 50000) throw new HttpError(413, "입력 내용이 너무 큽니다.");
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Invalid object");
    return value;
  } catch {
    throw new HttpError(400, "올바른 요청이 아닙니다.");
  }
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error(
    "MY KKACHI request failed",
    error instanceof Error ? error.name : "Unknown",
  );
  return Response.json(
    {
      error:
        "잠시 저장소에 연결할 수 없습니다. 입력 내용을 유지한 채 다시 시도해 주세요.",
    },
    { status: 503 },
  );
}
type Row = Omit<
  ContentItem,
  "slides" | "scheduledAt" | "createdAt" | "updatedAt"
> & {
  slides: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  published_snapshot: string | null;
  published_at: string | null;
};
export function itemFromRow(r: Row): ContentItem {
  return {
    ...r,
    slides: JSON.parse(r.slides),
    scheduledAt: r.scheduled_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
export async function allContent() {
  const result = await db()
    .prepare("SELECT * FROM content ORDER BY created_at DESC")
    .all<Row>();
  return result.results.map(itemFromRow);
}
export async function publicContent(locale: Locale) {
  const result = await db()
    .prepare(
      "SELECT * FROM content WHERE channel='seo' AND locale=? AND published_at IS NOT NULL ORDER BY published_at DESC",
    )
    .bind(locale)
    .all<Row>();
  return result.results.map((row) => ({
    ...itemFromRow(row),
    ...JSON.parse(row.published_snapshot!),
    updatedAt: row.published_at!,
  }));
}
export async function makePackage(topic: string, locale: Locale) {
  if (!TOPICS.includes(topic) || !["ko", "zh-TW"].includes(locale))
    throw new HttpError(400, "주제와 언어를 확인해 주세요.");
  const items = generatePackage(topic, locale);
  const inserted = await db().batch(
    items.map((i) =>
      db()
        .prepare(
          "INSERT INTO content (id,channel,locale,topic,title,slug,excerpt,body,keyword,slides,status,scheduled_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING",
        )
        .bind(
          i.id,
          i.channel,
          i.locale,
          i.topic,
          i.title,
          i.slug,
          i.excerpt,
          i.body,
          i.keyword,
          JSON.stringify(i.slides),
          i.status,
          null,
          i.createdAt,
          i.updatedAt,
        ),
    ),
  );
  const createdCount = inserted.reduce((n, r) => n + (r.rowCount ?? 0), 0);
  return { items: await allContent(), created: createdCount > 0, createdCount };
}
export type AutomationSettings = {
  enabled: boolean;
  locale: Locale;
  time: string;
  publishSeo: boolean;
};
export async function getSettings(): Promise<AutomationSettings> {
  const row = await db()
    .prepare("SELECT value FROM settings WHERE key='automation'")
    .first<{ value: string }>();
  return row
    ? JSON.parse(row.value)
    : { enabled: false, locale: "ko", time: "09:00", publishSeo: false };
}
export async function runAutomation(mode: "manual" | "scheduled") {
  const settings = await getSettings(),
    now = new Date();
  const keyDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const dayKey = `daily:${keyDate}:${settings.locale}`;
  let made = 0,
    published = 0;
  if (settings.enabled && (mode === "manual" || time >= settings.time)) {
    const claim = await db()
      .prepare(
        "INSERT INTO job_runs (id,started_at,summary,mode) VALUES (?,?,?,?) ON CONFLICT DO NOTHING",
      )
      .bind(dayKey, now.toISOString(), "실행 중", mode)
      .run();
    if (claim.meta.changes) {
      try {
        const rows = await allContent(),
          used = new Set(
            rows
              .filter((x) => x.locale === settings.locale)
              .map((x) => x.topic),
          );
        const topic = TOPICS.find((t) => !used.has(t));
        if (topic) {
          const result = await makePackage(topic, settings.locale);
          made = result.createdCount;
        }
        await db()
          .prepare("UPDATE job_runs SET summary=? WHERE id=?")
          .bind(
            made
              ? `${made}개 초안 생성`
              : "모든 주제가 이미 준비되어 있습니다.",
            dayKey,
          )
          .run();
      } catch (error) {
        await db()
          .prepare("DELETE FROM job_runs WHERE id=? AND summary=?")
          .bind(dayKey, "실행 중")
          .run();
        throw error;
      }
    }
  }
  if (settings.publishSeo) {
    const result = await db()
      .prepare(
        "UPDATE content SET status='published',scheduled_at=NULL,updated_at=?,published_at=?,published_snapshot=json_build_object('title',title,'body',body,'excerpt',excerpt)::text WHERE channel='seo' AND status='scheduled' AND scheduled_at<=?",
      )
      .bind(now.toISOString(), now.toISOString(), now.toISOString())
      .run();
    published = result.meta.changes || 0;
  }
  const summary = `초안 ${made}개 생성 · SEO ${published}개 발행`;
  await db()
    .prepare(
      "INSERT INTO job_runs (id,started_at,summary,mode) VALUES (?,?,?,?)",
    )
    .bind(crypto.randomUUID(), now.toISOString(), summary, mode)
    .run();
  return { made, published, summary };
}
