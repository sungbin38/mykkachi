"use client";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Users, MousePointerClick, CalendarCheck, Percent } from "lucide-react";
import { DeviceIcon } from "./admin-bookings";

type Session = { id: string; startedAt: string; lastSeenAt: string; landingPath: string | null; referrer: string | null; source: string; utmMedium: string | null; utmCampaign: string | null; device: string | null; country: string | null; city: string | null; pageViews: number; bookedAt: string | null; visits: number | null; trail: string | null };
type Report = { days: number; totals: { sessions: number; visitors: number; booked: number; page_views: number }; bySource: { source: string; sessions: number; booked: number }[]; byLanding: { path: string; sessions: number; booked: number }[]; byDevice: { device: string; sessions: number }[]; byDay: { day: string; sessions: number; booked: number }[]; funnel: [string, number][]; recent: Session[] };
const dt = (iso: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "0%");

export function TrafficPanel() {
  const [days, setDays] = useState(30);
  const [r, setR] = useState<Report | null>(null);
  const [error, setError] = useState("");
  async function load(d = days) {
    try { const res = await fetch(`/api/admin/traffic?days=${d}`); const data = (await res.json()) as Report & { error?: string }; if (!res.ok) throw new Error(data.error); setR(data); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "불러오지 못했습니다."); }
  }
  useEffect(() => { const t = setTimeout(() => void load(days), 0); return () => clearTimeout(t); }, [days]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return <div className="studio-empty"><Loader2 className="animate-spin" size={22} /><p>{error || "방문 기록을 불러오고 있어요."}</p></div>;
  const max = Math.max(1, ...r.byDay.map((d) => d.sessions));
  return <>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="traffic-toolbar"><div className="inline-actions">{[7, 30, 90].map((d) => <button key={d} className={`filter-button${days === d ? " active" : ""}`} onClick={() => setDays(d)}>최근 {d}일</button>)}</div><button className="icon-button" onClick={() => void load()} aria-label="새로고침"><RefreshCw size={15} /></button></div>
    <div className="metric-grid">
      <div className="metric-card"><span className="tiny-label muted"><Users size={12} /> 방문</span><strong>{r.totals.sessions}</strong><p>세션 {r.totals.sessions} · 방문자 {r.totals.visitors}</p></div>
      <div className="metric-card"><span className="tiny-label muted"><MousePointerClick size={12} /> 페이지 보기</span><strong>{r.totals.page_views}</strong><p>세션당 {r.totals.sessions ? Math.round((r.totals.page_views / r.totals.sessions) * 10) / 10 : 0}페이지</p></div>
      <div className="metric-card"><span className="tiny-label muted"><CalendarCheck size={12} /> 예약 완료</span><strong>{r.totals.booked}</strong><p>예약까지 간 세션</p></div>
      <div className="metric-card"><span className="tiny-label muted"><Percent size={12} /> 전환율</span><strong>{pct(r.totals.booked, r.totals.sessions)}</strong><p>방문 → 예약</p></div>
    </div>
    <section className="studio-panel"><div className="panel-heading"><h2>일별 방문</h2><span className="tiny-label muted">막대 = 세션 · 점 = 예약</span></div>
      <div className="day-bars">{r.byDay.length === 0 ? <p className="quiet-text">아직 기록이 없어요.</p> : r.byDay.map((d) => <div key={d.day} className="day-bar" title={`${d.day} · 세션 ${d.sessions} · 예약 ${d.booked}`}><span style={{ height: `${Math.max(4, (d.sessions / max) * 100)}%` }}>{d.booked > 0 && <i>{d.booked}</i>}</span><small>{d.day.slice(5)}</small></div>)}</div></section>
    <div className="studio-two-col">
      <section className="studio-panel"><div className="panel-heading"><h2>예약 퍼널</h2></div>
        <ul className="funnel">{r.funnel.map(([label, n], i) => <li key={label}><span className="funnel-label">{label}</span><span className="funnel-track"><span style={{ width: `${r.funnel[0][1] ? Math.max(2, (n / r.funnel[0][1]) * 100) : 0}%` }} /></span><strong>{n}</strong><small>{i === 0 ? "세션" : pct(n, r.funnel[0][1])}</small></li>)}</ul></section>
      <section className="studio-panel"><div className="panel-heading"><h2>어디서 들어왔나</h2></div>
        {r.bySource.length === 0 ? <p className="quiet-text">아직 기록이 없어요.</p> : <table className="traffic-table"><thead><tr><th>유입</th><th>세션</th><th>예약</th><th>전환</th></tr></thead><tbody>{r.bySource.map((s) => <tr key={s.source}><td>{s.source}</td><td>{s.sessions}</td><td>{s.booked}</td><td>{pct(s.booked, s.sessions)}</td></tr>)}</tbody></table>}
        <div className="panel-heading" style={{ marginTop: 22 }}><h2>첫 페이지</h2><span className="quiet-text">추적값을 제외한 경로별 집계</span></div>
        {r.byLanding.length === 0 ? <p className="quiet-text">아직 기록이 없어요.</p> : <table className="traffic-table"><thead><tr><th>경로</th><th>세션</th><th>예약</th></tr></thead><tbody>{r.byLanding.map((s) => <tr key={s.path}><td>{s.path}</td><td>{s.sessions}</td><td>{s.booked}</td></tr>)}</tbody></table>}
        <p className="device-row">{r.byDevice.map((d) => <span key={d.device}><DeviceIcon device={d.device} /> {d.device} {d.sessions}</span>)}</p>
      </section>
    </div>
    <section className="studio-panel"><div className="panel-heading"><h2>최근 방문 {r.recent.length}건</h2><span className="tiny-label muted">누가 · 언제 · 어디서 · 어떻게 이동했나</span></div>
      {r.recent.length === 0 ? <p className="quiet-text">아직 기록이 없어요. 사이트에 접속하면 여기에 쌓여요.</p> : <ul className="session-list">{r.recent.map((s) => <li key={s.id} className={s.bookedAt ? "booked" : ""}>
        <div className="session-head"><strong>{dt(s.startedAt)}</strong><span className="pill gray">{s.source}{s.utmCampaign ? ` / ${s.utmCampaign}` : ""}</span><span className="session-meta"><DeviceIcon device={s.device} /> {[s.country, s.city].filter(Boolean).join(" ") || "지역 미상"} · {s.visits ? `${s.visits}번째 방문` : "첫 방문"} · {s.pageViews}페이지</span>{s.bookedAt && <span className="pill">예약 완료</span>}</div>
        <p className="session-trail">{s.trail || s.landingPath || "-"}</p>
        {s.referrer && <p className="session-ref">from {s.referrer}</p>}
      </li>)}</ul>}
    </section>
  </>;
}
