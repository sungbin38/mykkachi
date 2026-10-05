import "server-only";
import { db, HttpError, runtime } from "./server";
import { BANK, BOOKING_HOURS, BOOKING_STATUSES, BOOKING_TOPICS, HOLD_HOURS, formatWon, priceFor, type BookingStatus } from "./booking-shared";
import { recordEvent, sessionSnapshot } from "./tracking";
export { BOOKING_HOURS, BOOKING_STATUSES, BOOKING_TOPICS, STATUS_LABEL, PRICE, type BookingStatus } from "./booking-shared";

export type Slot = { id: string; date: string; hour: number; status: "open" | "booked" | "closed" };
export type BookingSource = {
  landingPath?: string | null; referrer?: string | null; referrerHost?: string | null;
  utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null; utmContent?: string | null; utmTerm?: string | null;
  device?: string | null; country?: string | null; city?: string | null; startedAt?: string | null; pageViews?: number | null; visits?: number | null;
};
export type Booking = {
  id: string; slotId: string; date: string; hour: number; name: string; email: string; phone: string | null;
  birthDate: string; birthTime: string | null; birthUnknown: boolean; calendar: "solar" | "lunar"; gender: string | null;
  topic: string; story: string | null; depositName: string | null; amount: number; marketingConsent: boolean; status: BookingStatus;
  holdUntil: string | null; paidAt: string | null; note: string | null; reportSentAt: string | null; seenAt: string | null;
  visitorId: string | null; sessionId: string | null; source: BookingSource | null; createdAt: string; updatedAt: string;
};
type Row = {
  id: string; slot_id: string; date: string; hour: number; name: string; email: string; phone: string | null;
  birth_date: string; birth_time: string | null; birth_unknown: boolean; calendar: string; gender: string | null;
  topic: string; story: string | null; deposit_name: string | null; amount: number; marketing_consent: boolean; status: string; hold_until: string | Date | null;
  paid_at: string | Date | null; note: string | null; report_sent_at: string | Date | null; seen_at: string | Date | null;
  visitor_id: string | null; session_id: string | null; source: BookingSource | null; created_at: string | Date; updated_at: string | Date;
};
const iso = (v: string | Date | null) => (v == null ? null : v instanceof Date ? v.toISOString() : new Date(v).toISOString());
const fromRow = (r: Row): Booking => ({
  id: r.id, slotId: r.slot_id, date: r.date, hour: r.hour, name: r.name, email: r.email, phone: r.phone,
  birthDate: r.birth_date, birthTime: r.birth_time, birthUnknown: !!r.birth_unknown,
  calendar: r.calendar === "lunar" ? "lunar" : "solar", gender: r.gender, topic: r.topic, story: r.story,
  depositName: r.deposit_name, amount: r.amount, marketingConsent: !!r.marketing_consent, status: r.status as BookingStatus, holdUntil: iso(r.hold_until), paidAt: iso(r.paid_at),
  note: r.note, reportSentAt: iso(r.report_sent_at), seenAt: iso(r.seen_at), visitorId: r.visitor_id, sessionId: r.session_id,
  source: r.source, createdAt: iso(r.created_at)!, updatedAt: iso(r.updated_at)!,
});

export function todaySeoul() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function hourNowSeoul() {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
}
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isHour = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && BOOKING_HOURS.includes(v);

/** Requests that never paid within the hold window free their slot again. */
export async function releaseExpired() {
  const expired = await db()
    .prepare("UPDATE bookings SET status='expired', updated_at=now() WHERE status='requested' AND hold_until IS NOT NULL AND hold_until < now() RETURNING slot_id")
    .all<{ slot_id: string }>();
  if (expired.results.length)
    await db().batch(expired.results.map((r) => db().prepare("UPDATE booking_slots SET status='open' WHERE id=? AND status='booked'").bind(r.slot_id)));
  return expired.results.length;
}

export async function openSlots(): Promise<Slot[]> {
  await releaseExpired();
  const today = todaySeoul();
  const limit = new Date(Date.parse(today) + 70 * 86400000).toISOString().slice(0, 10);
  const rows = await db()
    .prepare("SELECT id,date,hour,status FROM booking_slots WHERE status='open' AND date>=? AND date<=? ORDER BY date,hour")
    .bind(today, limit)
    .all<Slot>();
  const nowHour = hourNowSeoul();
  return rows.results.filter((s) => s.date !== today || s.hour > nowHour);
}
export async function allSlots(from: string, to: string): Promise<Slot[]> {
  const rows = await db().prepare("SELECT id,date,hour,status FROM booking_slots WHERE date>=? AND date<=? ORDER BY date,hour").bind(from, to).all<Slot>();
  return rows.results;
}
export async function setSlots(date: unknown, hours: unknown, action: unknown) {
  if (!isDate(date) || !Array.isArray(hours) || !hours.every(isHour) || !["open", "close"].includes(action as string))
    throw new HttpError(400, "날짜와 시간을 확인해 주세요.");
  const statements = (hours as number[]).map((hour) =>
    action === "open"
      ? db().prepare("INSERT INTO booking_slots (id,date,hour,status) VALUES (?,?,?,'open') ON CONFLICT (date,hour) DO UPDATE SET status='open' WHERE booking_slots.status='closed'").bind(crypto.randomUUID(), date, hour)
      : db().prepare("DELETE FROM booking_slots WHERE date=? AND hour=? AND status='open'").bind(date, hour),
  );
  if (statements.length) await db().batch(statements);
  return allSlots(date, date);
}

export type BookingInput = {
  slotId: string; name: string; email: string; phone?: string; birthDate: string; birthTime?: string; birthUnknown: boolean;
  calendar: "solar" | "lunar"; gender?: string; topic: string; story?: string; depositName?: string; marketingConsent: boolean; visitorId?: string; sessionId?: string;
};
export function validateBooking(p: Record<string, unknown>): BookingInput {
  const str = (v: unknown, max: number) => (typeof v === "string" && v.trim().length <= max ? v.trim() : null);
  const name = str(p.name, 40), email = str(p.email, 120), slotId = str(p.slotId, 64), topic = str(p.topic, 40);
  if (!name || !email || !slotId || !topic) throw new HttpError(400, "이름, 이메일, 상담 주제, 예약 시간을 확인해 주세요.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "이메일 주소를 확인해 주세요.");
  if (!(BOOKING_TOPICS as readonly string[]).includes(topic)) throw new HttpError(400, "상담 주제를 확인해 주세요.");
  if (!isDate(p.birthDate) || p.birthDate < "1920-01-01" || p.birthDate > todaySeoul()) throw new HttpError(400, "생년월일을 확인해 주세요.");
  const birthUnknown = p.birthUnknown === true;
  const birthTime = birthUnknown ? null : str(p.birthTime, 5);
  if (!birthUnknown && !(birthTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime))) throw new HttpError(400, "태어난 시간을 고르거나 '모름'을 선택해 주세요.");
  const phone = str(p.phone, 30) || undefined;
  if (phone && !/^[\d\s()+-]{7,30}$/.test(phone)) throw new HttpError(400, "연락처 형식을 확인해 주세요.");
  const story = str(p.story, 2000) || undefined;
  const depositName = str(p.depositName, 40) || undefined;
  const gender = ["female", "male", "other"].includes(p.gender as string) ? (p.gender as string) : undefined;
  const id = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(v) ? v : undefined);
  return { slotId, name, email, phone, birthDate: p.birthDate, birthTime: birthTime || undefined, birthUnknown, calendar: p.calendar === "lunar" ? "lunar" : "solar", gender, topic, story, depositName, marketingConsent: p.marketingConsent === true, visitorId: id(p.visitorId), sessionId: id(p.sessionId) };
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  await releaseExpired();
  const slot = await db().prepare("SELECT id,date,hour,status FROM booking_slots WHERE id=?").bind(input.slotId).first<Slot>();
  const today = todaySeoul();
  if (!slot || slot.status !== "open" || slot.date < today || (slot.date === today && slot.hour <= hourNowSeoul()))
    throw new HttpError(409, "이 시간은 방금 마감되었어요. 다른 시간을 골라 주세요.");
  const claim = await db().prepare("UPDATE booking_slots SET status='booked' WHERE id=? AND status='open'").bind(slot.id).run();
  if (!claim.meta.changes) throw new HttpError(409, "이 시간은 방금 마감되었어요. 다른 시간을 골라 주세요.");
  const id = crypto.randomUUID();
  const source = input.sessionId ? await sessionSnapshot(input.sessionId, input.visitorId) : null;
  await db()
    .prepare(`INSERT INTO bookings (id,slot_id,date,hour,name,email,phone,birth_date,birth_time,birth_unknown,calendar,gender,topic,story,deposit_name,amount,marketing_consent,status,hold_until,visitor_id,session_id,source)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'requested',now()+make_interval(hours => ?),?,?,?::jsonb)`)
    .bind(id, slot.id, slot.date, slot.hour, input.name, input.email, input.phone ?? null, input.birthDate, input.birthTime ?? null, input.birthUnknown, input.calendar, input.gender ?? null, input.topic, input.story ?? null, input.depositName ?? null, priceFor(input.marketingConsent), input.marketingConsent, HOLD_HOURS, input.visitorId ?? null, input.sessionId ?? null, source ? JSON.stringify(source) : null)
    .run();
  if (input.sessionId) {
    await db().prepare("UPDATE sessions SET booked_at=now() WHERE id=? AND booked_at IS NULL").bind(input.sessionId).run().catch(() => {});
    await recordEvent(input.sessionId, input.visitorId || "unknown", "booking_created", "/book", { bookingId: id, date: slot.date, hour: slot.hour }).catch(() => {});
  }
  const booking = await getBooking(id);
  await notifyOwner(booking).catch((e) => console.error("booking notification failed", e instanceof Error ? e.message : e));
  return booking;
}

export async function getBooking(id: string): Promise<Booking> {
  const row = await db().prepare("SELECT * FROM bookings WHERE id=?").bind(id).first<Row>();
  if (!row) throw new HttpError(404, "예약을 찾을 수 없습니다.");
  return fromRow(row);
}
export async function listBookings(): Promise<Booking[]> {
  await releaseExpired();
  const rows = await db().prepare("SELECT * FROM bookings ORDER BY date DESC, hour DESC").all<Row>();
  return rows.results.map(fromRow);
}
export async function unseenCount() {
  const row = await db().prepare("SELECT count(*)::int AS n FROM bookings WHERE seen_at IS NULL").first<{ n: number }>();
  return row?.n ?? 0;
}
export async function markSeen() {
  await db().prepare("UPDATE bookings SET seen_at=now() WHERE seen_at IS NULL").run();
}
export async function updateBooking(id: string, p: Record<string, unknown>): Promise<Booking> {
  const current = await getBooking(id);
  const status = p.status === undefined ? current.status : (p.status as BookingStatus);
  if (!BOOKING_STATUSES.includes(status)) throw new HttpError(400, "상태 값을 확인해 주세요.");
  const note = p.note === undefined ? current.note : typeof p.note === "string" && p.note.length <= 2000 ? p.note : current.note;
  let reportSentAt = current.reportSentAt;
  if (p.reportSent === true && !reportSentAt) reportSentAt = new Date().toISOString();
  if (p.reportSent === false) reportSentAt = null;
  let paidAt = current.paidAt;
  if (status === "confirmed" && !paidAt) paidAt = new Date().toISOString();
  if (p.paid === false) paidAt = null;
  const wasOpen = ["cancelled", "expired"].includes(current.status), isOpen = ["cancelled", "expired"].includes(status);
  await db().prepare("UPDATE bookings SET status=?,note=?,report_sent_at=?,paid_at=?,updated_at=now() WHERE id=?").bind(status, note, reportSentAt, paidAt, id).run();
  if (isOpen && !wasOpen) await db().prepare("UPDATE booking_slots SET status='open' WHERE id=? AND status='booked'").bind(current.slotId).run();
  if (!isOpen && wasOpen) {
    const taken = await db().prepare("UPDATE booking_slots SET status='booked' WHERE id=? AND status='open'").bind(current.slotId).run();
    if (!taken.meta.changes) {
      const slot = await db().prepare("SELECT status FROM booking_slots WHERE id=?").bind(current.slotId).first<{ status: string }>();
      if (slot?.status === "booked") {
        const other = await db().prepare("SELECT id FROM bookings WHERE slot_id=? AND id<>? AND status IN ('requested','confirmed','done')").bind(current.slotId, id).first();
        if (other) { await db().prepare("UPDATE bookings SET status=?,updated_at=now() WHERE id=?").bind(current.status, id).run(); throw new HttpError(409, "그 시간에 이미 다른 예약이 있어요."); }
      }
    }
  }
  return getBooking(id);
}

export const formatSlot = (date: string, hour: number) => {
  const d = new Date(`${date}T00:00:00+09:00`);
  const day = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(d);
  return `${day} ${String(hour).padStart(2, "0")}:00–${String(hour + 1).padStart(2, "0")}:00`;
};
export function notificationConfigured() {
  const r = runtime();
  return !!(r.RESEND_API_KEY && r.NOTIFY_EMAIL);
}
async function sendMail(to: string, subject: string, text: string) {
  const r = runtime();
  if (!r.RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${r.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: r.FROM_EMAIL || "MY KKACHI <onboarding@resend.dev>", to: [to], subject, text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}
const bankLine = () => (BANK.account ? `${BANK.name} ${BANK.account} (예금주 ${BANK.holder || "마이까치"})` : "계좌는 확인 메일로 따로 안내드려요.");
async function notifyOwner(b: Booking) {
  const r = runtime();
  const when = formatSlot(b.date, b.hour);
  const src = b.source;
  const route = src ? [src.utmSource || src.referrerHost || "직접 방문", src.utmCampaign, src.landingPath].filter(Boolean).join(" · ") : "추적 정보 없음";
  const owner = [
    `새 상담 예약 요청이 들어왔어요. 입금 확인 후 확정해 주세요.`, ``, `일시: ${when}`, `이름: ${b.name} / 입금자명: ${b.depositName || b.name}`, `이메일: ${b.email}`, `연락처: ${b.phone || "-"}`,
    `생년월일: ${b.birthDate} (${b.calendar === "lunar" ? "음력" : "양력"}) ${b.birthUnknown ? "시간 모름" : b.birthTime}`, `주제: ${b.topic}`, `금액: ${formatWon(b.amount)}${b.marketingConsent ? " (마케팅 동의 할인)" : ""} · 입금 기한 ${HOLD_HOURS}시간`,
    `유입: ${route}`, ``, `사연:`, b.story || "(없음)", ``, `스튜디오에서 확인: /admin`,
  ];
  if (r.NOTIFY_EMAIL) await sendMail(r.NOTIFY_EMAIL, `[마이까치] 새 예약 요청 · ${when} · ${b.name}`, owner.join("\n"));
  await sendMail(b.email, `[마이까치] 예약 요청을 받았어요 · ${when}`, [
    `${b.name}님, 마이까치에 이야기를 건네주셔서 고마워요.`, ``, `요청하신 상담 시간: ${when} (최대 1시간, 이야기가 정리되면 더 일찍 끝날 수 있어요)`, `상담 비용: ${formatWon(b.amount)}${b.marketingConsent ? " (마케팅 동의 할인 적용)" : ""}`, `입금 계좌: ${bankLine()}`, `입금자명: ${b.depositName || b.name}`, ``,
    `${HOLD_HOURS}시간 안에 입금해 주시면 상담자가 확인한 뒤 확정 메일을 보내드려요. 기한이 지나면 자리가 다시 열려요.`,
    `상담이 끝나면 정리한 사주 리포트를 이 이메일로 보내드립니다.`, ``, `마이까치 · 내 이야기를 듣고, 내일을 함께 살피다`,
  ].join("\n")).catch(() => false);
}
