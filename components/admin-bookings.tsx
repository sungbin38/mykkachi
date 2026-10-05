"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MailCheck, RefreshCw, CalendarPlus, X, BellRing, BellOff, Banknote, Route, Smartphone, Monitor, Tablet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BOOKING_HOURS, BOOKING_STATUSES, STATUS_LABEL, formatWon, type BookingStatus } from "@/lib/booking-shared";

type Slot = { id: string; date: string; hour: number; status: "open" | "booked" | "closed" };
type Source = { landingPath?: string | null; referrer?: string | null; referrerHost?: string | null; utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null; utmContent?: string | null; device?: string | null; country?: string | null; city?: string | null; startedAt?: string | null; pageViews?: number | null; visits?: number | null };
type Booking = {
  id: string; slotId: string; date: string; hour: number; name: string; email: string; phone: string | null;
  birthDate: string; birthTime: string | null; birthUnknown: boolean; calendar: "solar" | "lunar"; gender: string | null;
  topic: string; story: string | null; depositName: string | null; amount: number; marketingConsent: boolean; status: BookingStatus; holdUntil: string | null; paidAt: string | null;
  note: string | null; reportSentAt: string | null; seenAt: string | null; visitorId: string | null; sessionId: string | null; source: Source | null; createdAt: string; updatedAt: string;
};
type Payload = { bookings: Booking[]; slots: Slot[]; unseen: number; notifications: boolean };
type Journey = { session: (Source & { id: string; source: string; lastSeenAt: string; language: string | null; screen: string | null }) | null; events: { event: string; path: string | null; meta: Record<string, unknown> | null; at: string }[]; otherSessions: { id: string; startedAt: string; source: string; landingPath: string | null; pageViews: number }[] };

const STATUS_CLASS: Record<BookingStatus, string> = { requested: "orange", confirmed: "blue", done: "", cancelled: "gray", expired: "gray" };
const EVENT_LABEL: Record<string, string> = { session_start: "방문 시작", page_view: "페이지 보기", cta_click: "예약 버튼 클릭", slot_selected: "시간 선택", booking_submit: "예약 제출", booking_created: "예약 완료", reading_complete: "무료 사주 완료" };
const todayKST = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dayLabel = (date: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T00:00:00+09:00`));
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const dt = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "-");
const genderLabel = (g: string | null) => (g === "female" ? "여성" : g === "male" ? "남성" : g === "other" ? "밝히지 않음" : "-");
export const DeviceIcon = ({ device }: { device: string | null | undefined }) => device === "mobile" ? <Smartphone size={13} /> : device === "tablet" ? <Tablet size={13} /> : <Monitor size={13} />;
export const sourceLabel = (s: Source | null | undefined) => (s ? [s.utmSource || s.referrerHost || "직접 방문", s.utmMedium, s.utmCampaign].filter(Boolean).join(" / ") : "추적 정보 없음");

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || "요청을 처리하지 못했습니다.");
  return data;
}

function JourneyPanel({ booking }: { booking: Booking }) {
  const [j, setJ] = useState<Journey | null | undefined>(undefined);
  useEffect(() => { const t = setTimeout(() => { api<Journey>(`/api/admin/bookings/${booking.id}/journey`).then(setJ).catch(() => setJ(null)); }, 0); return () => clearTimeout(t); }, [booking.id]);
  const s = booking.source;
  return <div className="journey">
    <h3><Route size={14} />이 사람은 어떻게 들어왔나</h3>
    {!s && !booking.sessionId ? <p className="quiet-text">추적 정보가 없어요. 추적 스크립트가 켜지기 전 예약이거나, 브라우저가 저장소를 막은 경우예요.</p> : <>
      <dl className="journey-facts">
        <div><dt>유입</dt><dd>{sourceLabel(s)}</dd></div>
        <div><dt>첫 페이지</dt><dd>{s?.landingPath || "-"}</dd></div>
        <div><dt>기기·지역</dt><dd><DeviceIcon device={s?.device} /> {s?.device || "-"} · {[s?.country, s?.city].filter(Boolean).join(" ") || "-"}</dd></div>
        <div><dt>방문</dt><dd>{s?.visits ? `${s.visits}번째 방문` : "-"} · 이번 세션 {s?.pageViews ?? 0}페이지</dd></div>
        <div><dt>세션 시작</dt><dd>{dt(s?.startedAt)}</dd></div>
        <div><dt>예약 완료</dt><dd>{dt(booking.createdAt)}</dd></div>
      </dl>
      {j === undefined ? <p className="quiet-text"><Loader2 size={12} className="animate-spin" /> 이동 경로 불러오는 중</p>
        : j === null ? <p className="quiet-text">이동 경로를 불러오지 못했어요.</p>
        : <>
          <ol className="journey-steps">{j.events.map((e, i) => <li key={i}><span className="journey-time">{new Date(e.at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span><span className={`journey-event ${e.event}`}>{EVENT_LABEL[e.event] || e.event}</span><span className="journey-path">{e.event === "page_view" ? e.path : e.meta ? Object.entries(e.meta).filter(([k]) => k !== "bookingId").map(([k, v]) => `${k}=${String(v)}`).join(" · ") : e.path}</span></li>)}</ol>
          {j.otherSessions.length > 0 && <p className="quiet-text">같은 방문자의 다른 방문 {j.otherSessions.length}회: {j.otherSessions.map((o) => `${dt(o.startedAt)} (${o.source}, ${o.pageViews}p)`).join(" · ")}</p>}
        </>}
    </>}
  </div>;
}

export function BookingsPanel({ onSeen }: { onSeen?: () => void }) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [date, setDate] = useState(todayKST());
  const [busyHour, setBusyHour] = useState<number | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  async function load() {
    try { const d = await api<Payload>("/api/admin/bookings?ack=1"); setData(d); setError(""); onSeen?.(); }
    catch (e) { setError(e instanceof Error ? e.message : "불러오지 못했습니다."); }
  }
  useEffect(() => { const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const daySlots = useMemo(() => new Map((data?.slots || []).filter((s) => s.date === date).map((s) => [s.hour, s])), [data, date]);
  const openDays = useMemo(() => {
    const m = new Map<string, { open: number; booked: number }>();
    for (const s of data?.slots || []) { const v = m.get(s.date) || { open: 0, booked: 0 }; if (s.status === "open") v.open++; if (s.status === "booked") v.booked++; m.set(s.date, v); }
    return [...m.entries()].sort();
  }, [data]);
  const bookings = useMemo(() => {
    const list = data?.bookings || []; const today = todayKST();
    return filter === "upcoming" ? list.filter((b) => b.date >= today && !["cancelled", "expired"].includes(b.status)).sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour) : list;
  }, [data, filter]);

  async function toggleHour(hour: number) {
    const slot = daySlots.get(hour); if (slot?.status === "booked") return;
    setBusyHour(hour);
    try { const r = await api<{ slots: Slot[] }>("/api/admin/slots", { method: "POST", body: JSON.stringify({ date, hours: [hour], action: slot?.status === "open" ? "close" : "open" }) }); setData((d) => d && { ...d, slots: [...d.slots.filter((s) => s.date !== date), ...r.slots] }); }
    catch (e) { setError(e instanceof Error ? e.message : "저장하지 못했습니다."); } finally { setBusyHour(null); }
  }
  async function openAll(hours: number[]) {
    setBusyHour(-1);
    try { const r = await api<{ slots: Slot[] }>("/api/admin/slots", { method: "POST", body: JSON.stringify({ date, hours, action: "open" }) }); setData((d) => d && { ...d, slots: [...d.slots.filter((s) => s.date !== date), ...r.slots] }); }
    catch (e) { setError(e instanceof Error ? e.message : "저장하지 못했습니다."); } finally { setBusyHour(null); }
  }
  async function patch(b: Booking, body: Record<string, unknown>) {
    setSaving(true);
    try {
      const r = await api<{ booking: Booking }>(`/api/admin/bookings/${b.id}`, { method: "PATCH", body: JSON.stringify(body) });
      setData((d) => d && { ...d, bookings: d.bookings.map((x) => (x.id === b.id ? r.booking : x)) });
      setSelected((s) => (s && s.id === b.id ? r.booking : s));
      if (body.status) await load();
    } catch (e) { setError(e instanceof Error ? e.message : "저장하지 못했습니다."); } finally { setSaving(false); }
  }

  if (!data) return <div className="studio-empty"><Loader2 className="animate-spin" size={22} /><p>{error || "예약 정보를 불러오고 있어요."}</p></div>;
  const waiting = data.bookings.filter((b) => b.status === "requested").length;
  return <>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="metric-grid bookings-metrics">
      <div className="metric-card"><span className="tiny-label muted">입금 대기</span><strong>{waiting}</strong><p>입금 확인이 필요한 요청</p></div>
      <div className="metric-card"><span className="tiny-label muted">확정된 상담</span><strong>{bookings.filter((b) => b.status === "confirmed").length}</strong><p>다가오는 1:1 상담</p></div>
      <div className="metric-card"><span className="tiny-label muted">열린 시간</span><strong>{data.slots.filter((s) => s.status === "open" && s.date >= todayKST()).length}</strong><p>예약 가능한 1시간 슬롯</p></div>
      <div className="metric-card"><span className="tiny-label muted">알림</span><strong className="metric-inline">{data.notifications ? <BellRing size={20} /> : <BellOff size={20} />}</strong><p>{data.notifications ? "새 예약을 이메일로 받아요" : "RESEND_API_KEY · NOTIFY_EMAIL 미설정"}</p></div>
    </div>
    <div className="studio-two-col bookings-layout">
      <section className="studio-panel">
        <div className="panel-heading"><h2>상담 가능 시간 열기</h2><button className="icon-button" onClick={() => void load()} aria-label="새로고침"><RefreshCw size={15} /></button></div>
        <p className="panel-footnote">날짜를 고르고 시간을 눌러 열거나 닫아요. 예약된 시간은 닫을 수 없어요.</p>
        <div className="slot-date-row">
          <input className="input-control" type="date" value={date} min={todayKST()} onChange={(e) => setDate(e.target.value)} />
          <button className="outline-button" disabled={busyHour !== null} onClick={() => openAll(BOOKING_HOURS.filter((h) => h >= 10 && h <= 18))}><CalendarPlus size={14} />10–19시 한번에 열기</button>
        </div>
        <p className="slot-day-label">{dayLabel(date)}</p>
        <div className="slot-grid">
          {BOOKING_HOURS.map((h) => { const s = daySlots.get(h); const st = s?.status || "closed"; return <button key={h} type="button" disabled={busyHour !== null || st === "booked"} className={`slot-cell ${st}`} onClick={() => toggleHour(h)} aria-pressed={st === "open"}>{busyHour === h ? <Loader2 size={13} className="animate-spin" /> : null}<span>{hh(h)}</span><small>{st === "open" ? "열림" : st === "booked" ? "예약됨" : "닫힘"}</small></button>; })}
        </div>
        <div className="slot-summary">
          <h3>앞으로 열린 날</h3>
          {openDays.filter(([d]) => d >= todayKST()).length === 0 ? <p className="quiet-text">아직 연 날이 없어요. 위에서 시간을 열어주세요.</p>
            : <ul>{openDays.filter(([d]) => d >= todayKST()).map(([d, v]) => <li key={d}><button type="button" onClick={() => setDate(d)}>{dayLabel(d)}</button><span>열림 {v.open} · 예약 {v.booked}</span></li>)}</ul>}
        </div>
      </section>
      <section className="studio-panel">
        <div className="panel-heading"><h2>예약 목록</h2><div className="inline-actions"><button className={`filter-button${filter === "upcoming" ? " active" : ""}`} onClick={() => setFilter("upcoming")}>다가오는</button><button className={`filter-button${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>전체 {data.bookings.length}</button></div></div>
        {bookings.length === 0 ? <div className="quiet-empty"><p>{filter === "upcoming" ? "다가오는 예약이 없어요." : "아직 예약이 없어요."}</p></div>
          : <ul className="booking-list">{bookings.map((b) => <li key={b.id}><button type="button" className="booking-row" onClick={() => { setSelected(b); setNote(b.note || ""); }}>
            <div className="booking-when"><strong>{dayLabel(b.date)}</strong><span>{hh(b.hour)}–{hh(b.hour + 1)}</span></div>
            <div className="booking-who"><strong>{b.name}</strong><span>{b.topic} · {sourceLabel(b.source)}</span></div>
            <div className="booking-flags"><span className={`pill ${STATUS_CLASS[b.status]}`}>{STATUS_LABEL[b.status]}</span>{b.reportSentAt && <span className="pill"><MailCheck size={12} />리포트</span>}{!b.seenAt && <span className="pill red">NEW</span>}</div>
          </button></li>)}</ul>}
      </section>
    </div>
    <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
      <DialogContent className="booking-dialog">
        {selected && <>
          <DialogHeader><DialogTitle>{selected.name}님 · {dayLabel(selected.date)} {hh(selected.hour)}–{hh(selected.hour + 1)}</DialogTitle><DialogDescription>{dt(selected.createdAt)} 요청 · {selected.topic} · <span className={`pill ${STATUS_CLASS[selected.status]}`}>{STATUS_LABEL[selected.status]}</span></DialogDescription></DialogHeader>
          <div className="booking-pay-row">
            <div><strong>{formatWon(selected.amount)}{selected.marketingConsent && <em className="consent-tag">마케팅 동의</em>}</strong><span>입금자명 {selected.depositName || selected.name}{selected.status === "requested" && selected.holdUntil ? ` · 기한 ${dt(selected.holdUntil)}` : ""}{selected.paidAt ? ` · 입금 확인 ${dt(selected.paidAt)}` : ""}</span></div>
            {selected.status === "requested" && <button type="button" className="primary-button small" disabled={saving} onClick={() => patch(selected, { status: "confirmed" })}><Banknote size={15} />입금 확인 · 확정</button>}
          </div>
          <dl className="booking-detail">
            <div><dt>이메일</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
            <div><dt>연락처</dt><dd>{selected.phone || "-"}</dd></div>
            <div><dt>생년월일</dt><dd>{selected.birthDate} ({selected.calendar === "lunar" ? "음력" : "양력"})</dd></div>
            <div><dt>태어난 시간</dt><dd>{selected.birthUnknown ? "모름" : selected.birthTime}</dd></div>
            <div><dt>성별</dt><dd>{genderLabel(selected.gender)}</dd></div>
            <div><dt>리포트</dt><dd>{selected.reportSentAt ? `보냄 · ${dt(selected.reportSentAt)}` : "아직"}</dd></div>
          </dl>
          <div className="booking-story-box"><h3>남긴 사연</h3><p>{selected.story || "남긴 사연이 없어요."}</p></div>
          <JourneyPanel booking={selected} />
          <div className="booking-actions">
            <div className="inline-actions">{BOOKING_STATUSES.map((s) => <button key={s} type="button" disabled={saving || selected.status === s} className={`filter-button${selected.status === s ? " active" : ""}`} onClick={() => patch(selected, { status: s })}>{STATUS_LABEL[s]}</button>)}</div>
            <button type="button" className="outline-button" disabled={saving} onClick={() => patch(selected, { reportSent: !selected.reportSentAt })}>{selected.reportSentAt ? <><X size={14} />리포트 발송 취소</> : <><Mail size={14} />리포트 보냈어요</>}</button>
          </div>
          <label className="field"><span className="field-label">상담 메모 (나만 보는 메모)</span><textarea className="input-control booking-story" rows={4} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (selected.note || "") && patch(selected, { note })} placeholder="상담 중 메모, 리포트에 넣을 내용 등" /></label>
          <p className="panel-footnote">취소하거나 기한이 지나면 그 시간은 다시 예약 가능으로 열려요. 리포트는 이메일 앱에서 PDF를 첨부해 보낸 뒤 여기서 표시해 두세요.</p>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
