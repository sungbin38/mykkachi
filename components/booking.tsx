"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Banknote, CalendarDays, Check, Clock3, Copy, Loader2, LockKeyhole, Mail, Lightbulb } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site";
import { BirthFields, BirthTimeField } from "@/components/birth-fields";
import { BANK, DURATION_TEXT, HOLD_MINUTES, MARKETING_CONSENT_TEXT, STORY_EXAMPLES, PRICE_BASE, PRICE_MARKETING, bankAccountDigits, bankAccountDisplay, bankConfigured, formatWon, priceFor } from "@/lib/booking-shared";
import { FREE_READING_ENABLED, homePath } from "@/lib/brand";
import { ids, track } from "@/lib/track-client";

type Slot = { id: string; date: string; hour: number };
type Form = {
  name: string; email: string; phone: string; birthDate: string; birthTime: string; birthUnknown: boolean;
  calendar: "solar" | "lunar"; gender: string; story: string; depositName: string; marketingConsent: boolean; agree: boolean;
};
type Done = { date: string; hour: number; email: string; name: string; amount: number; marketingConsent: boolean; holdUntil: string | null; depositName: string };
const dayLabel = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T00:00:00+09:00`));
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
const deadline = (iso: string | null) => (iso ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : `${HOLD_MINUTES}분 이내`);

export function BankBox({ depositName, amount }: { depositName?: string; amount: number }) {
  const [copied, setCopied] = useState(false);
  return <div className="bank-box">
    <p className="bank-box-label"><Banknote size={15} />입금 계좌</p>
    {bankConfigured() ? <>
      <p className="bank-box-account"><strong>{BANK.name} <span className="bank-account-number">{bankAccountDisplay()}</span></strong><button type="button" className="bank-copy" aria-label="계좌번호 숫자만 복사" onClick={() => { navigator.clipboard?.writeText(bankAccountDigits()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "복사됨" : "복사"}</button></p>
      <p className="bank-box-sub">예금주 {BANK.holder || "마이까치"} · 금액 {formatWon(amount)}{depositName ? ` · 입금자명 ${depositName}` : ""}</p>
    </> : <p className="bank-box-sub">{BANK.name} 계좌번호는 예약 확인 메일로 안내드려요. 금액 {formatWon(amount)}.</p>}
  </div>;
}

export function BookingPage() {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState<Form>({ name: "", email: "", phone: "", birthDate: "", birthTime: "", birthUnknown: false, calendar: "solar", gender: "", story: "", depositName: "", marketingConsent: false, agree: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const loadSlots = () => fetch("/api/booking/slots").then((r) => r.json() as Promise<{ slots?: Slot[] }>).then((d) => setSlots(d.slots || [])).catch(() => setSlots([]));
  useEffect(() => {
    void loadSlots();
    const prefill = setTimeout(() => { try { const birth = sessionStorage.getItem("luun-start-birth"); if (birth) setForm((f) => ({ ...f, birthDate: birth })); } catch {} }, 0);
    return () => clearTimeout(prefill);
  }, []);
  const byDate = useMemo(() => { const map = new Map<string, Slot[]>(); for (const s of slots || []) map.set(s.date, [...(map.get(s.date) || []), s]); return map; }, [slots]);
  const dates = [...byDate.keys()];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) { setError("상담 시간을 먼저 골라 주세요."); return; }
    if (!form.birthDate) { setError("생년월일을 끝까지 골라 주세요."); return; }
    if (!form.agree) { setError("개인정보 이용 안내에 동의해 주세요."); return; }
    setBusy(true); setError("");
    track("booking_submit", { date: slot.date, hour: slot.hour });
    try {
      const { vid, sid } = ids();
      const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slotId: slot.id, phone: form.phone || undefined, gender: form.gender || undefined, story: form.story || undefined, depositName: form.depositName || undefined, visitorId: vid, sessionId: sid }) });
      const data = (await res.json()) as { error?: string } & Done;
      if (!res.ok) { setError(data.error || "예약을 처리하지 못했어요."); if (res.status === 409) { setSlot(null); void loadSlots(); } return; }
      setDone(data);
      window.scrollTo({ top: 0 });
    } catch { setError("네트워크 오류가 발생했어요. 잠시 뒤 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }

  if (done) return <><SiteHeader /><main className="shell booking-page"><section className="booking-done">
    <span className="booking-done-icon"><Check size={22} /></span>
    <p className="tiny-label muted">BOOKING REQUESTED</p>
    <h1>{done.name}님, 자리를 잡아두었어요.</h1>
    <p className="booking-done-slot"><CalendarDays size={16} />{dayLabel(done.date)} · {hourLabel(done.hour)}–{hourLabel(done.hour + 1)}</p>
    <BankBox depositName={done.depositName} amount={done.amount} />
    <p className="booking-done-amount">상담 비용 <strong>{formatWon(done.amount)}</strong>{done.marketingConsent ? " · 마케팅 동의 할인 적용" : ""}</p>
    <p className="booking-deadline"><Clock3 size={14} /><strong>지금 바로 입금해 주세요.</strong> {deadline(done.holdUntil)}까지 입금이 확인되지 않으면 예약이 자동 취소돼요.</p>
    <ol className="booking-next">
      <li><strong>입금하면 예약이 확정돼요.</strong> {HOLD_MINUTES}분 안에 입금해 주세요. 상담자가 입금을 확인한 뒤 <em>{done.email}</em>로 확정 메일과 상담 방법을 보내드려요.</li>
      <li><strong>약속한 시간에 1:1로 만나요.</strong> 미리 남겨주신 사연과 명식을 바탕으로 최대 1시간 이야기를 나눠요. 이야기가 정리되면 더 일찍 끝날 수도 있어요.</li>
      <li><strong>상담 뒤, 사주 리포트가 도착해요.</strong> 상담 내용을 정리한 리포트를 같은 이메일로 보내드려요.</li>
    </ol>
    <div className="hero-actions"><a className="primary-button" href={homePath("ko")}>홈으로 돌아가기</a>{FREE_READING_ENABLED && <a className="text-link" href="/read">기다리는 동안 무료 사주 보기<ArrowRight size={16} /></a>}</div>
  </section></main><SiteFooter /></>;

  return <><SiteHeader /><main className="shell booking-page">
    <a href={homePath("ko") + "#consultation"} className="booking-back"><ArrowLeft size={15} />상담 안내로 돌아가기</a>
    <header className="booking-heading">
      <p className="tiny-label muted">BOOK A CONVERSATION</p>
      <h1>상담 시간을 골라주세요.</h1>
      <p>최대 1시간, 상담자가 직접 당신의 사주와 이야기를 읽어요. 이야기가 정리되면 더 일찍 끝날 수도 있어요.<br />시간을 고르고 정보를 남긴 뒤 <strong>{formatWon(PRICE_BASE)}</strong>(마케팅 동의 시 <strong>{formatWon(PRICE_MARKETING)}</strong>)을 입금하면 예약이 확정됩니다.</p>
    </header>
    <form className="booking-layout" onSubmit={submit}>
      <section className="booking-step">
        <h2><span className="step-number">STEP 01</span>날짜와 시간</h2>
        {slots === null ? <p className="booking-empty"><Loader2 size={16} className="animate-spin" />가능한 시간을 불러오고 있어요.</p>
          : dates.length === 0 ? <p className="booking-empty">지금은 열린 상담 시간이 없어요. 곧 새 일정이 열리니 조금만 기다려 주세요.</p>
          : <>
            <div className="booking-dates" role="radiogroup" aria-label="날짜 선택">{dates.map((d) => <button type="button" key={d} role="radio" aria-checked={date === d} className={`booking-chip${date === d ? " on" : ""}`} onClick={() => { setDate(d); setSlot(null); }}>{dayLabel(d)}<span>{byDate.get(d)!.length}자리</span></button>)}</div>
            {date && <div className="booking-hours" role="radiogroup" aria-label="시간 선택">{byDate.get(date)!.map((s) => <button type="button" key={s.id} role="radio" aria-checked={slot?.id === s.id} className={`booking-chip hour${slot?.id === s.id ? " on" : ""}`} onClick={() => { setSlot(s); track("slot_selected", { date: s.date, hour: s.hour }); }}><Clock3 size={14} />{hourLabel(s.hour)}–{hourLabel(s.hour + 1)}</button>)}</div>}
            {slot && <p className="booking-selected"><Check size={15} />{dayLabel(slot.date)} {hourLabel(slot.hour)}–{hourLabel(slot.hour + 1)} 선택됨</p>}
          </>}
      </section>
      <section className="booking-step">
        <h2><span className="step-number">STEP 02</span>나를 알려주세요</h2>
        <div className="field-row">
          <label className="field"><span className="field-label">이름 *</span><input className="input-control" required maxLength={40} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="어떻게 불러드릴까요?" /></label>
          <label className="field"><span className="field-label">이메일 * <small>리포트를 받을 주소</small></span><input className="input-control" type="email" required maxLength={120} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" /></label>
        </div>
        <label className="field"><span className="field-label">연락처 (선택)</span><input className="input-control" type="tel" maxLength={30} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-0000-0000" /></label>
        <div className="field"><span className="field-label">생년월일 *</span>
          <div className="birth-row">
            <div className="booking-toggle" role="radiogroup" aria-label="양력 음력">{(["solar", "lunar"] as const).map((c) => <button type="button" key={c} role="radio" aria-checked={form.calendar === c} className={form.calendar === c ? "on" : ""} onClick={() => set("calendar", c)}>{c === "solar" ? "양력" : "음력"}</button>)}</div>
            <BirthFields value={form.birthDate} onChange={(d) => set("birthDate", d)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field"><label className="field-label" htmlFor="birth-hour">태어난 시간 {form.birthUnknown ? "" : "*"}</label><BirthTimeField id="birth-hour" value={form.birthTime} onChange={(t) => set("birthTime", t)} disabled={form.birthUnknown} /></div>
          <label className="checkbox-label booking-check"><input type="checkbox" checked={form.birthUnknown} onChange={(e) => set("birthUnknown", e.target.checked)} />태어난 시간을 몰라요</label>
        </div>
        <div className="field"><span className="field-label">성별 (선택)</span><div className="booking-toggle" role="radiogroup">{[["female", "여성"], ["male", "남성"], ["other", "밝히지 않음"]].map(([v, l]) => <button type="button" key={v} role="radio" aria-checked={form.gender === v} className={form.gender === v ? "on" : ""} onClick={() => set("gender", form.gender === v ? "" : v)}>{l}</button>)}</div></div>
      </section>
      <section className="booking-step">
        <h2><span className="step-number">STEP 03</span>어떤 이야기를 나누고 싶나요?</h2>
        <div className="story-help"><button type="button" className="story-example-toggle" aria-expanded={showExamples} onClick={() => setShowExamples((v) => !v)}><Lightbulb size={14} />어떻게 적어야 할지 모르겠다면, 예시 보기</button>
          {showExamples && <ul className="story-examples">{STORY_EXAMPLES.map((ex) => <li key={ex.title}><span className="pill">{ex.title}</span><p>{ex.text}</p><button type="button" className="text-link" onClick={() => { set("story", ex.text); setShowExamples(false); }}>이 예시로 시작하기<ArrowRight size={13} /></button></li>)}</ul>}</div>
        <label className="field"><span className="field-label">사연 (선택) <small>{form.story.length}/2000</small></span><textarea className="input-control booking-story" rows={6} maxLength={2000} value={form.story} onChange={(e) => set("story", e.target.value)} placeholder="지금 가장 마음에 걸리는 일, 상담에서 꼭 묻고 싶은 것을 편하게 적어주세요. 잘 정리되지 않아도 괜찮아요. 예) 이직을 고민 중인데 지금 움직여도 되는 시기인지 궁금해요." /></label>
      </section>
      <section className="booking-step">
        <h2><span className="step-number">STEP 04</span>입금 안내</h2>
        <p className="booking-price"><strong>{formatWon(priceFor(form.marketingConsent))}</strong><span>{DURATION_TEXT} 1:1 상담 + 상담 후 사주 리포트</span></p>
        <label className={`consent-card${form.marketingConsent ? " on" : ""}`}><input type="checkbox" checked={form.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} /><span><strong>마케팅 활용에 동의하고 {formatWon(PRICE_MARKETING)}에 상담하기</strong><small>{MARKETING_CONSENT_TEXT} 동의하지 않아도 {formatWon(PRICE_BASE)}에 상담할 수 있어요.</small></span></label>
        <BankBox amount={priceFor(form.marketingConsent)} />
        <label className="field"><span className="field-label">입금자명 <small>이름과 다르면 적어주세요</small></span><input className="input-control" maxLength={40} value={form.depositName} onChange={(e) => set("depositName", e.target.value)} placeholder={form.name || "입금할 때 쓰는 이름"} /></label>
        <p className="booking-hint"><strong>예약 요청 뒤 바로 입금해 주세요.</strong> {HOLD_MINUTES}분 안에 입금이 확인되지 않으면 예약이 자동으로 취소되고 자리가 다시 열려요. 입금이 확인되면 확정 메일을 보내드립니다.</p>
        <label className="checkbox-label booking-check"><input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} />입력한 정보는 상담 예약·입금 확인·리포트 발송에만 사용하고, 상담 뒤 요청하시면 지워드려요. 동의합니다. *</label>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="primary-button booking-submit" type="submit" disabled={busy || !slot}>{busy ? <Loader2 size={17} className="animate-spin" /> : <Mail size={17} />}{slot ? "이 시간으로 예약 요청하기" : "시간을 먼저 골라주세요"}</button>
        <p className="privacy-hint"><LockKeyhole size={13} />사이트에서 결제하지 않아요. 계좌이체 입금을 확인한 뒤 상담자가 직접 확정 안내를 드립니다.</p>
      </section>
    </form>
  </main><SiteFooter /></>;
}
