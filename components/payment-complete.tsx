"use client";
import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site";
import { BookingDone } from "@/components/booking";
import { bookingText } from "@/lib/booking-copy";
import { KAKAO_URL, localPath, type Locale } from "@/lib/brand";
import { clearPending, loadPending, requestCardPayment, verifyPayment, type PayOutcome } from "@/lib/payment-client";

/** Where mobile browsers land after the PortOne payment page: verify on the server, then confirm or offer a retry. */
export function PaymentComplete({ locale = "ko", paymentId, failed, message }: { locale?: Locale; paymentId: string; failed: boolean; message?: string }) {
  const zh = locale === "zh-TW";
  const t = bookingText(locale);
  const [outcome, setOutcome] = useState<PayOutcome | null>(failed ? { state: "cancelled", message } : null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (failed) return;
    let live = true;
    void verifyPayment(paymentId).then((o) => { if (!live) return; if (o.state === "paid") clearPending(); setOutcome(o); });
    return () => { live = false; };
  }, [failed, paymentId]);
  const formPath = () => `${localPath(locale, "/book")}?product=${loadPending()?.product ?? "consultation"}`;
  async function retry() {
    const order = loadPending();
    if (!order) { window.location.assign(formPath()); return; }
    setBusy(true);
    try {
      const o = await requestCardPayment(order);
      if (o.state === "redirecting") return;
      if (o.state === "paid") clearPending();
      setOutcome(o);
    } catch { setOutcome({ state: "failed" }); }
    setBusy(false);
  }
  return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="shell booking-page">
    {outcome?.state === "paid" && outcome.booking ? <BookingDone done={outcome.booking} locale={locale} />
      : <section className="booking-done">
        {!outcome ? <><p className="booking-empty"><Loader2 size={16} className="animate-spin" />{t("결제를 확인하고 있어요.")}</p></> : <>
          <p className="tiny-label muted">PAYMENT</p>
          <h1>{outcome.state === "pending" ? t("결제를 확인하고 있어요.") : t("결제가 완료되지 않았어요.")}</h1>
          <p className="booking-hint">{outcome.state === "pending" ? t("결제 확인이 늦어지고 있어요. 결제가 완료됐다면 확정 메일이 곧 도착해요. 메일이 오지 않으면 카카오톡으로 문의해 주세요.")
            : (!zh && outcome.message) || t("결제가 완료되지 않았어요. 다시 시도해 주세요.")}</p>
          <div className="hero-actions">
            {outcome.state !== "pending" && outcome.state !== "refunded" && <button type="button" className="primary-button" disabled={busy} onClick={retry}>{busy ? <Loader2 size={17} className="animate-spin" /> : <CreditCard size={17} />}{t("다시 결제하기")}</button>}
            <button type="button" className="text-link" onClick={() => window.location.assign(formPath())}>{t("신청서로 돌아가기")}</button>
          </div>
          <p className="booking-contact"><a href={KAKAO_URL} target="_blank" rel="noreferrer">{zh ? "KakaoTalk 客服" : "카카오톡 문의"}</a></p>
        </>}
      </section>}
  </main><SiteFooter locale={locale} /></>;
}
