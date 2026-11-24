"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, CalendarDays, Check, Clock3, CreditCard, Loader2, LockKeyhole, Mail, Lightbulb, UserRound } from "lucide-react";
import { KakaoConsultationNotice } from "./kakao-consultation-notice";
import { SiteHeader, SiteFooter } from "@/components/site";
import { BirthFields, BirthTimeField } from "@/components/birth-fields";
import { DURATION_TEXT, CONTACT_CONSENT_TEXT, MARKETING_CONSENT_TEXT, TERMS_CONSENT_TEXT, WITHDRAWAL_CONSENT_TEXT, REFUND_SUMMARY, STORY_EXAMPLES, BOOKING_PRODUCTS, type BookingProduct, type BookingSummary, priceFor, offerFor } from "@/lib/booking-shared";
import { DRAFT_KEY, clearPending, loadPending, requestCardPayment } from "@/lib/payment-client";
import { FREE_READING_ENABLED, homePath, localPath, KAKAO_URL, type Locale } from "@/lib/brand";
import { ids, track } from "@/lib/track-client";
import { PromoCountdown } from "./promo-countdown";

import { bookingText } from "@/lib/booking-copy";
import { bookingZoneLabel, bookingSlotLocal, bookingDay, bookingSlotLabel, bookingMoney } from "@/lib/booking-locale";

type Slot = { id: string; date: string; hour: number };
type Form = {
  name: string; email: string; phone: string; birthDate: string; birthTime: string; birthUnknown: boolean;
  calendar: "solar" | "lunar"; gender: string; story: string; marketingConsent: boolean; agree: boolean; agreeTerms: boolean; agreeWithdrawal: boolean;
};
const EMPTY_FORM: Form = { name: "", email: "", phone: "", birthDate: "", birthTime: "", birthUnknown: false, calendar: "solar", gender: "", story: "", marketingConsent: false, agree: false, agreeTerms: false, agreeWithdrawal: false };
/** Confirmation shown once the server has verified the card payment (on /book and on the mobile return page). */
export function BookingDone({ done, locale = "ko" }: { done: BookingSummary; locale?: Locale }) {
  const zh = locale === "zh-TW";
  const t = bookingText(locale);
  return <section className="booking-done">
    <span className="booking-done-icon"><Check size={22} /></span>
    <p className="tiny-label muted">BOOKING CONFIRMED</p>
    <h1>{done.name}{zh ? "，" : "님, "} {done.product === "report" ? t("리포트 신청이 확정됐어요.") : t("예약이 확정됐어요.")}</h1>
    {done.date !== null && done.hour !== null ? <p className="booking-done-slot"><CalendarDays size={16} />{bookingSlotLabel(done.date, done.hour, locale)}</p> : <p className="booking-done-slot"><Mail size={16} />{t("사주 리포트 · 약 하루 뒤 PDF 이메일 수령")}</p>}
    <p className="booking-done-amount">{t("결제 금액")}{" "}<strong>{bookingMoney(done.amount, locale)}</strong>{done.marketingConsent ? t(" · 후기 활용 동의 할인 적용") : ""}</p>
    {done.product === "consultation" && <KakaoConsultationNotice locale={locale} />}
    <ol className="booking-next">
      <li><strong>{t("결제가 완료되어 신청이 확정됐어요.")}</strong> {zh ? "確認信已寄至 " : "확정 안내를 "}<em>{done.email}</em>{zh ? "。" : "로 보내드렸어요."}</li>
      {done.product === "report" ? <>
        <li><strong>{t("남겨주신 사연과 명식을 읽어요.")}</strong>{t("상담자가 직접 분석하고 작성해요. 한 분 한 분 직접 쓰기 때문에 약 하루가 걸립니다.")}</li>
        <li><strong>{t("PDF 리포트를 이메일로 받아요.")}</strong>{t("신청할 때 남긴 질문과 사연을 바탕으로 작성한 약 10페이지 분량의 리포트를 보내드려요.")}</li>
      </> : <>
        <li><strong>{t("약속한 시간에 카카오톡 1:1 채팅으로 만나요.")}</strong>{t("미리 남겨주신 사연과 명식을 바탕으로 최대 1시간 이야기를 나눠요. 이야기가 정리되면 더 일찍 끝날 수도 있어요.")}</li>
        <li><strong>{t("상담 뒤, 사주 리포트가 도착해요.")}</strong>{t("상담 후 직접 분석하고 작성한 약 10페이지 PDF 리포트를 같은 이메일로 보내드려요. 작성에는 약 하루가 걸립니다.")}</li>
      </>}
    </ol>
    <p className="booking-contact">{zh ? "取消與退款請參考" : "취소·환불은 "}<a href="/terms#refund">{zh ? "退款政策（韓文）" : "환불정책"}</a>{zh ? "，或透過 KakaoTalk 聯絡我們。" : "을 확인하거나 카카오톡으로 문의해 주세요."}{" "}<a href={KAKAO_URL} target="_blank" rel="noreferrer">{zh ? "KakaoTalk 客服" : "카카오톡 문의"}</a></p>
    <div className="hero-actions"><a className="primary-button" href={homePath(locale)}>{t("홈으로 돌아가기")}</a>{FREE_READING_ENABLED && <a className="text-link" href={localPath(locale, "/read")}>{t("기다리는 동안 무료 사주 보기")}<ArrowRight size={16} /></a>}</div>
  </section>;
}

function BookingCalendar({ byDate, date, onSelect, locale }: { locale: Locale; byDate: Map<string, Slot[]>; date: string; onSelect: (date: string) => void }) {
  const zh = locale === "zh-TW";
  const t = bookingText(locale);
  const dayLabel = (d: string) => bookingDay(d, locale);
  const dates = [...byDate.keys()].sort();
  const firstMonth = dates[0].slice(0, 7);
  const lastMonth = dates[dates.length - 1].slice(0, 7);
  const [month, setMonth] = useState(() => date.slice(0, 7) || firstMonth);
  const visibleMonth = month < firstMonth || month > lastMonth ? firstMonth : month;
  const [year, monthNumber] = visibleMonth.split("-").map(Number);
  const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const move = (delta: number) => { setMonth(new Date(Date.UTC(year, monthNumber - 1 + delta, 1)).toISOString().slice(0, 7)); onSelect(""); };
  return <div className="booking-calendar">
    <div className="booking-calendar-heading">
      <h3 aria-live="polite">{year}{zh ? "年" : "년"} {monthNumber}{zh ? "月" : "월"}</h3>
      <div><button type="button" aria-label={t("이전 달")} disabled={visibleMonth <= firstMonth} onClick={() => move(-1)}><ChevronLeft size={18} /></button><button type="button" aria-label={t("다음 달")} disabled={visibleMonth >= lastMonth} onClick={() => move(1)}><ChevronRight size={18} /></button></div>
    </div>
    <div className="booking-calendar-week" aria-hidden="true">{(zh ? ["日", "一", "二", "三", "四", "五", "六"] : ["일", "월", "화", "수", "목", "금", "토"]).map(day => <span key={day}>{day}</span>)}</div>
    <div className="booking-calendar-days" role="group" aria-label={`${year}-${monthNumber} ${zh ? "選擇日期" : "날짜 선택"}`}>
      {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} aria-hidden="true" />)}
      {Array.from({ length: days }, (_, i) => {
        const value = `${visibleMonth}-${String(i + 1).padStart(2, "0")}`;
        const available = (byDate.get(value)?.length || 0) > 0;
        return <button type="button" key={value} disabled={!available} aria-pressed={date === value} aria-label={`${dayLabel(value)}, ${available ? (zh ? "可預約" : "예약 가능") : t("예약 불가")}`} onClick={() => onSelect(value)}><strong>{i + 1}</strong></button>;
      })}
    </div>
    <p className="booking-calendar-help">{date ? `${dayLabel(date)} · ${zh ? "請在下方選擇時段。" : "아래에서 시간을 골라주세요."}` : t("예약 가능한 날짜를 선택하면 시간을 볼 수 있어요.")}</p>
  </div>;
}

export function BookingPage({ initialProduct = "consultation", locale = "ko" }: { initialProduct?: BookingProduct; locale?: Locale }) {
  const zh = locale === "zh-TW";
  const t = bookingText(locale);
  const formatWon = (n: number) => bookingMoney(n, locale);
  const [product, setProduct] = useState<BookingProduct>(initialProduct);
  const reportOnly = product === "report";
  const offer = offerFor(product);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<BookingSummary | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const loadSlots = () => fetch("/api/booking/slots").then((r) => r.json() as Promise<{ slots?: Slot[] }>).then((d) => setSlots(d.slots || [])).catch(() => setSlots([]));
  useEffect(() => {
    // Restore what was typed when the visitor comes back from an unfinished payment; consents are asked again.
    const prefill = setTimeout(() => { try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") as Partial<Form> | null;
      const birth = sessionStorage.getItem("luun-start-birth");
      if (draft) setForm({ ...EMPTY_FORM, ...draft, agree: false, agreeTerms: false, agreeWithdrawal: false });
      else if (birth) setForm((f) => ({ ...f, birthDate: birth }));
    } catch {} }, 0);
    return () => clearTimeout(prefill);
  }, []);
  useEffect(() => { if (product === "consultation") void loadSlots(); }, [product]);
  const byDate = useMemo(() => { const map = new Map<string, Slot[]>(); for (const s of slots || []) { const d = bookingSlotLocal(s.date, s.hour, locale).date; map.set(d, [...(map.get(d) || []), s]); } return map; }, [slots, locale]);
  const dates = [...byDate.keys()];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportOnly && !slot) { setError(t("상담 시간을 먼저 골라 주세요.")); return; }
    if (!form.phone.trim()) { setError(t("연락처를 적어 주세요.")); return; }
    if (!form.birthDate) { setError(t("생년월일을 끝까지 골라 주세요.")); return; }
    if (!form.gender) { setError(t("성별을 골라 주세요.")); return; }
    if (form.story.trim().length < 10) { setError(t("사연을 조금 더 적어 주세요. 남겨주신 내용을 읽고 준비해요.")); return; }
    if (!form.agree) { setError(t("정보 이용과 소식 안내 수신에 동의해 주세요.")); return; }
    if (!form.agreeTerms) { setError(t("이용약관 및 환불정책에 동의해 주세요.")); return; }
    if (reportOnly && !form.agreeWithdrawal) { setError(t("리포트 청약철회 제한 안내를 확인해 주세요.")); return; }
    setBusy(true); setError("");
    track("booking_submit", { product, date: reportOnly ? null : slot?.date, hour: reportOnly ? null : slot?.hour });
    try {
      const { vid, sid } = ids();
      try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
      // 1) Save the order as awaiting payment. The server sets the amount; an earlier unpaid attempt from this browser is released.
      const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, product, locale, slotId: reportOnly ? undefined : slot?.id, phone: form.phone.trim(), gender: form.gender, story: form.story.trim(), termsAgreed: form.agreeTerms, withdrawalAgreed: form.agreeWithdrawal, replaces: loadPending()?.id, visitorId: vid, sessionId: sid }) });
      const order = (await res.json()) as { error?: string } & BookingSummary;
      if (!res.ok) { setError(zh ? (res.status === 409 ? "此時段剛被預約，請選擇其他時間。" : t("예약을 처리하지 못했어요.")) : order.error || t("예약을 처리하지 못했어요.")); if (res.status === 409) { setSlot(null); void loadSlots(); } return; }
      // 2) Card payment window, then 3) server-side verification.
      const outcome = await requestCardPayment({ ...order, phone: form.phone.trim(), locale });
      if (outcome.state === "redirecting") return;
      if (outcome.state === "paid" && outcome.booking) { clearPending(); setDone(outcome.booking); window.scrollTo({ top: 0 }); return; }
      if (outcome.state === "refunded" && !reportOnly) { setSlot(null); void loadSlots(); }
      setError(outcome.state === "pending" ? t("결제 확인이 늦어지고 있어요. 결제가 완료됐다면 확정 메일이 곧 도착해요. 메일이 오지 않으면 카카오톡으로 문의해 주세요.")
        : (!zh && outcome.message) || t("결제가 완료되지 않았어요. 다시 시도해 주세요."));
    } catch { setError(t("네트워크 오류가 발생했어요. 잠시 뒤 다시 시도해 주세요.")); }
    finally { setBusy(false); }
  }

  if (done) return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="shell booking-page"><BookingDone done={done} locale={locale} /></main><SiteFooter locale={locale} /></>;

  return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="shell booking-page">
    <a href={homePath(locale) + "#consultation"} className="booking-back"><ArrowLeft size={15} />{t("상담 안내로 돌아가기")}</a>
    <header className="booking-heading">
      <p className="tiny-label muted">BOOK A CONVERSATION</p>
      <h1>{t("대만·한국 사주 상담 9년차, 돈쌤이 직접 자세히 봐드립니다.")}</h1>
      <p>{t("카카오톡 채팅으로 나누는 1:1 상담, 또는 글로 받아보는 사주 리포트.")}<br />{t("당신에게 편한 방식을 고르고, 궁금한 이야기를 남겨주세요.")}</p>
    </header>
    <div className="booking-products" role="group" aria-label={t("상품 선택")}>
      {(Object.keys(BOOKING_PRODUCTS) as BookingProduct[]).map(key => <button key={key} type="button" aria-pressed={product === key} onClick={() => { setProduct(key); setError(""); }}>
        <strong>{zh ? (key === "report" ? "八字報告" : "一對一八字諮詢") : BOOKING_PRODUCTS[key].name}</strong>
        <span>{key === "report" ? t("상담 없이 글로 · 약 10페이지 PDF, 약 하루 뒤 이메일 수령") : t("최대 1시간 카카오톡 1:1 채팅 · 약 10페이지 PDF, 상담 후 약 하루 뒤 발송")}</span>
        <span className="booking-product-condition">{offerFor(key).promo && <span className="promo-badge">{zh ? "11月特價" : "11월 특가"}</span>}{t("마케팅 활용 동의 시")}</span>
        <span className="booking-product-price">{offerFor(key).promo && <s className="service-regular-price">{formatWon(offerFor(key).regular)}</s>}<b>{formatWon(offerFor(key).marketing)}</b><span className="service-saving">{offerFor(key).promo ? `${Math.round((1 - offerFor(key).marketing / offerFor(key).regular) * 100)}% ` : formatWon(offerFor(key).base - offerFor(key).marketing)}{t("할인")}</span></span>
        <small>{offerFor(key).promo ? t("미동의 시") : t("미동의 시 기본가")}{" "}{formatWon(offerFor(key).base)}{offerFor(key).promo ? (zh ? `・原價 ${formatWon(offerFor(key).regular)}` : ` · 정가 ${formatWon(offerFor(key).regular)}`) : ""}</small>
        {offerFor(key).promo && <PromoCountdown locale={locale} />}
      </button>)}
    </div>
    <form className={`booking-layout${reportOnly ? " booking-report-layout" : ""}`} onSubmit={submit}>
      {!reportOnly && <section className="booking-step">
        <h2><span className="step-number">STEP 01</span>{t("날짜와 시간")}</h2>
        <p className="booking-timezone">{bookingZoneLabel(locale)}</p>
        {slots === null ? <p className="booking-empty"><Loader2 size={16} className="animate-spin" />{t("가능한 시간을 불러오고 있어요.")}</p>
          : dates.length === 0 ? <p className="booking-empty">{t("지금은 열린 상담 시간이 없어요. 곧 새 일정이 열리니 조금만 기다려 주세요.")}</p>
          : <>
            <BookingCalendar locale={locale} byDate={byDate} date={date} onSelect={(value) => { setDate(value); setSlot(null); }} />
            {date && <div className="booking-hours" role="radiogroup" aria-label={t("시간 선택")}>{(byDate.get(date) || []).map((s) => <button type="button" key={s.id} role="radio" aria-checked={slot?.id === s.id} className={`booking-chip hour${slot?.id === s.id ? " on" : ""}`} onClick={() => { setSlot(s); track("slot_selected", { date: s.date, hour: s.hour }); }}><Clock3 size={14} />{bookingSlotLocal(s.date, s.hour, locale).start}–{bookingSlotLocal(s.date, s.hour, locale).end}</button>)}</div>}
            {slot && <p className="booking-selected"><Check size={15} />{bookingSlotLabel(slot.date, slot.hour, locale)} {t("선택됨")}</p>}
          </>}
      </section>}
      <section className="booking-step">
        <h2><span className="step-number">{reportOnly ? "STEP 01" : "STEP 02"}</span>{t("나를 알려주세요")}</h2>
        <div className="field-row">
          <label className="field"><span className="field-label">{t("이름 *")}</span><input className="input-control" required maxLength={40} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("어떻게 불러드릴까요?")} /></label>
          <label className="field"><span className="field-label">{t("이메일 *")}{" "}<small>{t("리포트를 받을 주소")}</small></span><input className="input-control" type="email" required maxLength={120} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" /></label>
        </div>
        <label className="field"><span className="field-label">{t("연락처 *")}{" "}<small>{t("예약 확인 연락용")}</small></span><input className="input-control" type="tel" required maxLength={30} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={zh ? "+886 912 345 678" : "010-0000-0000"} /></label>
        <div className="field"><span className="field-label">{t("생년월일 *")}</span>
          <div className="birth-row">
            <div className="booking-toggle" role="radiogroup" aria-label={t("양력 음력")}>{(["solar", "lunar"] as const).map((c) => <button type="button" key={c} role="radio" aria-checked={form.calendar === c} className={form.calendar === c ? "on" : ""} onClick={() => set("calendar", c)}>{c === "solar" ? t("양력") : t("음력")}</button>)}</div>
            <BirthFields zh={zh} value={form.birthDate} onChange={(d) => set("birthDate", d)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field"><label className="field-label" htmlFor="birth-hour">{t("태어난 시간")}{" "}{form.birthUnknown ? "" : "*"}</label><BirthTimeField zh={zh} id="birth-hour" value={form.birthTime} onChange={(t) => set("birthTime", t)} disabled={form.birthUnknown} /></div>
          <label className="checkbox-label booking-check"><input type="checkbox" checked={form.birthUnknown} onChange={(e) => set("birthUnknown", e.target.checked)} />{t("태어난 시간을 몰라요")}</label>
        </div>
        <div className="field"><span className="field-label">{t("성별 *")}</span><div className="booking-toggle" role="radiogroup" aria-label={t("성별")}>{[["female", t("여성")], ["male", t("남성")]].map(([v, l]) => <button type="button" key={v} role="radio" aria-checked={form.gender === v} className={form.gender === v ? "on" : ""} onClick={() => set("gender", v)}>{l}</button>)}</div></div>
      </section>
      <section className="booking-step">
        <h2><span className="step-number">{reportOnly ? "STEP 02" : "STEP 03"}</span>{reportOnly ? t("리포트에서 무엇을 알고 싶나요?") : t("어떤 이야기를 나누고 싶나요?")}</h2>
        <div className="story-help"><button type="button" className="story-example-toggle" aria-expanded={showExamples} onClick={() => setShowExamples((v) => !v)}><Lightbulb size={14} />{t("어떻게 적어야 할지 모르겠다면, 예시 보기")}</button>
          {showExamples && <ul className="story-examples">{(zh ? [{ title: "工作與轉職", text: "我在目前的公司工作了五年，最近收到新公司的邀請。想了解現在是否適合轉職，以及未來一年的工作方向。" }, { title: "感情與關係", text: "我和交往兩年的伴侶正在討論結婚，但最近在金錢與家庭問題上經常有不同想法。希望了解彼此的相處方式及適合的時機。" }] : STORY_EXAMPLES).map((ex) => <li key={ex.title}><span className="pill">{ex.title}</span><p>{ex.text}</p><button type="button" className="text-link" onClick={() => { set("story", ex.text); setShowExamples(false); }}>{t("이 예시로 시작하기")}<ArrowRight size={13} /></button></li>)}</ul>}</div>
        <label className="field"><span className="field-label">{t("사연 *")}{" "}<small>{form.story.length}/2000</small></span><textarea className="input-control booking-story" rows={6} required maxLength={2000} value={form.story} onChange={(e) => set("story", e.target.value)} placeholder={t("지금 가장 마음에 걸리는 일, 풀이에서 꼭 알고 싶은 것을 구체적으로 적어주세요. 상황, 고민이 시작된 시기, 듣고 싶은 답을 함께 적으면 더 깊이 볼 수 있어요.")} /></label>
        <p className="story-note"><UserRound size={14} />{t("연인, 배우자, 자녀처럼 다른 사람의 사주도 함께 봐야 한다면 그분의 생년월일, 태어난 시간, 성별을 사연에 같이 적어주세요. 이 정보가 없으면 상대방 풀이는 어려워요.")}</p>
      </section>
      <section className="booking-step">
        <h2><span className="step-number">{reportOnly ? "STEP 03" : "STEP 04"}</span>{t("결제")}</h2>
        <p className="booking-price"><strong>{formatWon(priceFor(form.marketingConsent, product))}</strong><span>{reportOnly ? t("사람이 직접 분석·작성한 약 10페이지 PDF를 이메일로 받아요. 제작에는 약 하루가 걸립니다.") : (zh ? "最長一小時的 KakaoTalk 一對一文字諮詢＋諮詢後的八字報告" : `${DURATION_TEXT} 카카오톡 1:1 채팅 상담 + 상담 후 사주 리포트`)}</span></p>
        <label className={`consent-card${form.marketingConsent ? " on" : ""}`}><input type="checkbox" checked={form.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} /><span><strong>{zh ? "同意匿名行銷使用，以 " : "마케팅 활용에 동의하고 "}{formatWon(offer.marketing)}{zh ? " " : "에 "}{reportOnly ? t("리포트 받기") : t("상담하기")}</strong><small>{zh ? "同意將諮詢或報告中的故事與解讀，隱去姓名及個資後用於行銷心得與內容。未同意也可申請，原價 " : `${MARKETING_CONSENT_TEXT} 동의하지 않아도 `}{formatWon(offer.base)}{zh ? "。" : "에 신청할 수 있어요."}</small></span></label>
        {!reportOnly && <KakaoConsultationNotice locale={locale} />}
        <div className="refund-summary"><strong>{t("취소·환불 안내")}</strong><p>{t(REFUND_SUMMARY[product])}{" "}<a href="/terms#refund" target="_blank" rel="noreferrer">{zh ? "退款政策全文（韓文）" : "환불정책 전체 보기"}</a></p></div>
        <p className="booking-hint"><strong>{t("결제가 완료되면 바로 확정돼요.")}</strong> {reportOnly ? t("결제 후 제작을 시작하며, 약 하루 뒤 리포트를 이메일로 보내드려요.") : t("확정 메일을 바로 보내드립니다.")}</p>
        <div className="payment-agreements">
          <label className="checkbox-label booking-check"><input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} /><span>{zh ? "我同意將填寫資料用於預約、報告申請、付款確認與寄送報告，並透過電子郵件與電話接收 DON SSAEM 的消息及活動通知。可隨時回覆拒收，使用服務後也可要求刪除資料。*" : CONTACT_CONSENT_TEXT}</span></label>
          <label className="checkbox-label booking-check"><input type="checkbox" checked={form.agreeTerms} onChange={(e) => set("agreeTerms", e.target.checked)} /><span>{t(TERMS_CONSENT_TEXT)} *{" "}<a href="/terms" target="_blank" rel="noreferrer">{zh ? "使用條款" : "이용약관"}</a>{" · "}<a href="/terms#refund" target="_blank" rel="noreferrer">{zh ? "退款政策" : "환불정책"}</a></span></label>
          {reportOnly && <label className="checkbox-label booking-check"><input type="checkbox" checked={form.agreeWithdrawal} onChange={(e) => set("agreeWithdrawal", e.target.checked)} /><span>{t(WITHDRAWAL_CONSENT_TEXT)} *</span></label>}
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="primary-button booking-submit" type="submit" disabled={busy || (!reportOnly && !slot)}>{busy ? <Loader2 size={17} className="animate-spin" /> : <CreditCard size={17} />}{!reportOnly && !slot ? t("시간을 먼저 골라주세요") : `${formatWon(priceFor(form.marketingConsent, product))} ${t("카드로 결제하기")}`}</button>
        <p className="privacy-hint"><LockKeyhole size={13} /><span>{t("결제는 포트원·토스페이먼츠의 결제창에서 진행되며, 카드 정보는 돈쌤 서버에 저장되지 않아요.")}</span></p>
        {KAKAO_URL && <p className="privacy-hint"><Mail size={13} /><span>{zh ? "預約前有疑問？" : "예약 전에 궁금한 점이 있다면 "}<a href={KAKAO_URL} target="_blank" rel="noreferrer">{zh ? "用 KakaoTalk 問我們" : "카카오톡으로 편하게 물어보세요"}</a></span></p>}
      </section>
    </form>
  </main><SiteFooter locale={locale} /></>;
}
