import "server-only";
import { db, HttpError } from "./server";

export const TRACK_EVENTS = ["session_start", "page_view", "cta_click", "slot_selected", "booking_submit", "booking_created", "reading_complete"] as const;
export type TrackEvent = (typeof TRACK_EVENTS)[number];
const ID = /^[A-Za-z0-9_-]{8,64}$/;
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null);

export function deviceFromUA(ua: string | null) {
  if (!ua) return "unknown";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|Android|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}
function hostOf(url: string | null) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

export type TrackPayload = {
  vid: string; sid: string; event: TrackEvent; path?: string; meta?: Record<string, unknown>;
  landing?: { path?: string; referrer?: string; utm?: Record<string, string>; language?: string; screen?: string };
};
export function parseTrack(p: Record<string, unknown>): TrackPayload {
  const vid = p.vid, sid = p.sid, event = p.event;
  if (typeof vid !== "string" || !ID.test(vid) || typeof sid !== "string" || !ID.test(sid)) throw new HttpError(400, "bad ids");
  if (typeof event !== "string" || !(TRACK_EVENTS as readonly string[]).includes(event)) throw new HttpError(400, "bad event");
  const path = clip(p.path, 300) || undefined;
  const meta = p.meta && typeof p.meta === "object" && !Array.isArray(p.meta) ? (p.meta as Record<string, unknown>) : undefined;
  let landing: TrackPayload["landing"];
  if (p.landing && typeof p.landing === "object") {
    const l = p.landing as Record<string, unknown>;
    const utm: Record<string, string> = {};
    if (l.utm && typeof l.utm === "object") for (const k of ["source", "medium", "campaign", "content", "term"]) { const v = (l.utm as Record<string, unknown>)[k]; if (typeof v === "string" && v) utm[k] = v.slice(0, 120); }
    landing = { path: clip(l.path, 300) || undefined, referrer: clip(l.referrer, 500) || undefined, utm, language: clip(l.language, 20) || undefined, screen: clip(l.screen, 20) || undefined };
  }
  return { vid, sid, event: event as TrackEvent, path, meta: meta ? JSON.parse(JSON.stringify(meta).slice(0, 2000)) : undefined, landing };
}

export async function recordTrack(t: TrackPayload, headers: Headers) {
  const ua = headers.get("user-agent");
  const country = headers.get("x-vercel-ip-country"), city = headers.get("x-vercel-ip-city");
  if (t.event === "session_start") {
    const l = t.landing || {};
    await db().batch([
      db().prepare("INSERT INTO visitors (id,sessions) VALUES (?,1) ON CONFLICT (id) DO UPDATE SET last_seen=now(), sessions=visitors.sessions+1").bind(t.vid),
      db().prepare(`INSERT INTO sessions (id,visitor_id,landing_path,referrer,referrer_host,utm_source,utm_medium,utm_campaign,utm_content,utm_term,device,user_agent,language,screen,country,city)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING`)
        .bind(t.sid, t.vid, l.path ?? t.path ?? null, l.referrer ?? null, hostOf(l.referrer ?? null), l.utm?.source ?? null, l.utm?.medium ?? null, l.utm?.campaign ?? null, l.utm?.content ?? null, l.utm?.term ?? null,
          deviceFromUA(ua), ua ? ua.slice(0, 300) : null, l.language ?? null, l.screen ?? null, country ? decodeURIComponent(country) : null, city ? decodeURIComponent(city) : null),
      // Beacons can arrive out of order: reconcile page views that landed before the session row existed.
      db().prepare("UPDATE sessions SET page_views=(SELECT count(*) FROM track_events WHERE session_id=? AND event='page_view') WHERE id=?").bind(t.sid, t.sid),
    ]);
  }
  await recordEvent(t.sid, t.vid, t.event, t.path ?? null, t.meta ?? null);
}
export async function recordEvent(sid: string, vid: string, event: string, path: string | null, meta: Record<string, unknown> | null) {
  await db().batch([
    db().prepare("INSERT INTO track_events (session_id,visitor_id,event,path,meta) VALUES (?,?,?,?,?::jsonb)").bind(sid, vid, event, path, meta ? JSON.stringify(meta) : null),
    db().prepare(`UPDATE sessions SET last_seen_at=now(), page_views=page_views+? WHERE id=?`).bind(event === "page_view" ? 1 : 0, sid),
    db().prepare("UPDATE visitors SET last_seen=now() WHERE id=?").bind(vid),
  ]);
}

type SessionRow = {
  id: string; visitor_id: string; started_at: Date | string; last_seen_at: Date | string; landing_path: string | null; referrer: string | null; referrer_host: string | null;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; utm_term: string | null; device: string | null;
  language: string | null; screen: string | null; country: string | null; city: string | null; page_views: number; booked_at: Date | string | null; visits?: number;
};
const iso = (v: Date | string | null) => (v == null ? null : new Date(v).toISOString());
export async function sessionSnapshot(sid: string, vid?: string) {
  const s = await db().prepare("SELECT s.*, v.sessions AS visits FROM sessions s LEFT JOIN visitors v ON v.id=s.visitor_id WHERE s.id=?").bind(sid).first<SessionRow>();
  if (!s) return vid ? { visits: null } : null;
  return {
    landingPath: s.landing_path, referrer: s.referrer, referrerHost: s.referrer_host, utmSource: s.utm_source, utmMedium: s.utm_medium, utmCampaign: s.utm_campaign,
    utmContent: s.utm_content, utmTerm: s.utm_term, device: s.device, country: s.country, city: s.city, startedAt: iso(s.started_at), pageViews: s.page_views, visits: s.visits ?? null,
  };
}

export type JourneyEvent = { event: string; path: string | null; meta: Record<string, unknown> | null; at: string };
export async function journey(sessionId: string | null, visitorId: string | null): Promise<{ session: ReturnType<typeof shapeSession> | null; events: JourneyEvent[]; otherSessions: ReturnType<typeof shapeSession>[] }> {
  const session = sessionId ? await db().prepare("SELECT s.*, v.sessions AS visits FROM sessions s LEFT JOIN visitors v ON v.id=s.visitor_id WHERE s.id=?").bind(sessionId).first<SessionRow>() : null;
  const events = sessionId ? (await db().prepare("SELECT event,path,meta,created_at FROM track_events WHERE session_id=? ORDER BY created_at, id").bind(sessionId).all<{ event: string; path: string | null; meta: Record<string, unknown> | null; created_at: Date | string }>()).results : [];
  const others = visitorId ? (await db().prepare("SELECT s.*, v.sessions AS visits FROM sessions s LEFT JOIN visitors v ON v.id=s.visitor_id WHERE s.visitor_id=? AND s.id<>? ORDER BY s.started_at DESC LIMIT 10").bind(visitorId, sessionId || "").all<SessionRow>()).results : [];
  return { session: session ? shapeSession(session) : null, events: events.map((e) => ({ event: e.event, path: e.path, meta: e.meta, at: iso(e.created_at)! })), otherSessions: others.map(shapeSession) };
}
export function shapeSession(s: SessionRow) {
  return {
    id: s.id, visitorId: s.visitor_id, startedAt: iso(s.started_at)!, lastSeenAt: iso(s.last_seen_at)!, landingPath: s.landing_path, referrer: s.referrer, referrerHost: s.referrer_host,
    utmSource: s.utm_source, utmMedium: s.utm_medium, utmCampaign: s.utm_campaign, utmContent: s.utm_content, utmTerm: s.utm_term, device: s.device, language: s.language, screen: s.screen,
    country: s.country, city: s.city, pageViews: s.page_views, bookedAt: iso(s.booked_at), visits: s.visits ?? null,
    source: s.utm_source || s.referrer_host || "direct",
  };
}

export async function trafficReport(days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const [totals, bySource, byLanding, byDevice, byDay, recent, funnel] = await Promise.all([
    db().prepare("SELECT count(*)::int AS sessions, count(DISTINCT visitor_id)::int AS visitors, count(booked_at)::int AS booked, coalesce(sum(page_views),0)::int AS page_views FROM sessions WHERE started_at>=?").bind(since).first<{ sessions: number; visitors: number; booked: number; page_views: number }>(),
    db().prepare("SELECT coalesce(utm_source, referrer_host, 'direct') AS source, count(*)::int AS sessions, count(booked_at)::int AS booked FROM sessions WHERE started_at>=? GROUP BY 1 ORDER BY 2 DESC LIMIT 12").bind(since).all<{ source: string; sessions: number; booked: number }>(),
    db().prepare("SELECT coalesce(landing_path,'-') AS path, count(*)::int AS sessions, count(booked_at)::int AS booked FROM sessions WHERE started_at>=? GROUP BY 1 ORDER BY 2 DESC LIMIT 10").bind(since).all<{ path: string; sessions: number; booked: number }>(),
    db().prepare("SELECT coalesce(device,'unknown') AS device, count(*)::int AS sessions FROM sessions WHERE started_at>=? GROUP BY 1 ORDER BY 2 DESC").bind(since).all<{ device: string; sessions: number }>(),
    db().prepare("SELECT to_char(started_at AT TIME ZONE 'Asia/Seoul','YYYY-MM-DD') AS day, count(*)::int AS sessions, count(booked_at)::int AS booked FROM sessions WHERE started_at>=? GROUP BY 1 ORDER BY 1").bind(since).all<{ day: string; sessions: number; booked: number }>(),
    db().prepare(`SELECT s.*, v.sessions AS visits, (SELECT string_agg(coalesce(e.path,'·'), ' → ' ORDER BY e.created_at, e.id) FROM track_events e WHERE e.session_id=s.id AND e.event='page_view') AS trail
      FROM sessions s LEFT JOIN visitors v ON v.id=s.visitor_id WHERE s.started_at>=? ORDER BY s.started_at DESC LIMIT 60`).bind(since).all<SessionRow & { trail: string | null }>(),
    db().prepare(`SELECT event, count(DISTINCT session_id)::int AS sessions FROM track_events WHERE created_at>=? AND event IN ('page_view','cta_click','slot_selected','booking_submit','booking_created') GROUP BY 1`).bind(since).all<{ event: string; sessions: number }>(),
  ]);
  const funnelMap = Object.fromEntries(funnel.results.map((f) => [f.event, f.sessions]));
  return {
    days, since,
    totals: totals ?? { sessions: 0, visitors: 0, booked: 0, page_views: 0 },
    bySource: bySource.results, byLanding: byLanding.results, byDevice: byDevice.results, byDay: byDay.results,
    funnel: [["방문", funnelMap.page_view || 0], ["예약 버튼 클릭", funnelMap.cta_click || 0], ["시간 선택", funnelMap.slot_selected || 0], ["예약 제출", funnelMap.booking_submit || 0], ["예약 완료", funnelMap.booking_created || 0]] as [string, number][],
    recent: recent.results.map((r) => ({ ...shapeSession(r), trail: r.trail })),
  };
}
