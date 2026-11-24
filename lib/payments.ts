import "server-only";
import { Webhook } from "svix";
import { alertOwner, bookingSummary, confirmPaid, getBooking, updateBooking, type Booking } from "./booking";
import { bookingIdFromPayment, formatWon, type BookingSummary } from "./booking-shared";
import { HttpError, runtime } from "./server";

// PortOne V2 REST API. The secret stays on the server; the browser only ever holds the public store ID and channel key.
const API = "https://api.portone.io";
export const portoneConfigured = () => !!runtime().PORTONE_API_SECRET;
async function portone(path: string, init?: RequestInit) {
  const secret = runtime().PORTONE_API_SECRET;
  if (!secret) throw new HttpError(503, "카드 결제를 준비하고 있어요. 잠시 뒤 다시 시도해 주세요.");
  return fetch(API + path, { ...init, headers: { Authorization: `PortOne ${secret}`, "Content-Type": "application/json" } });
}
type PortOnePayment = { status?: string; amount?: { total?: number }; currency?: string };
async function fetchPayment(paymentId: string): Promise<PortOnePayment | null> {
  const res = await portone(`/payments/${encodeURIComponent(paymentId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`PortOne lookup ${res.status}`);
  return (await res.json()) as PortOnePayment;
}
/** Full cancellation (refund) of a paid payment. Also the call an admin refund would use. */
export async function cancelPayment(paymentId: string, reason: string) {
  const res = await portone(`/payments/${encodeURIComponent(paymentId)}/cancel`, { method: "POST", body: JSON.stringify({ reason }) });
  if (!res.ok) throw new Error(`PortOne cancel ${res.status}`);
}

export type PaymentResult = { state: "paid" | "pending" | "failed" | "refunded"; message?: string; booking: BookingSummary };
/** Money was taken for an order we cannot honour: give it back and tell the owner. */
async function refund(booking: Booking, paymentId: string, reason: string, message: string): Promise<PaymentResult> {
  try {
    await cancelPayment(paymentId, reason);
  } catch (e) {
    await alertOwner(`[돈쌤] 자동 환불 실패 · 직접 취소 필요 · ${booking.name}`, [`결제번호: ${paymentId}`, `예약번호: ${booking.id}`, `사유: ${reason}`, `포트원 콘솔에서 이 결제를 직접 취소해 주세요.`]).catch(() => false);
    throw e;
  }
  await alertOwner(`[돈쌤] 결제 자동 취소 · ${booking.name}`, [`결제번호: ${paymentId}`, `예약번호: ${booking.id}`, `금액: ${formatWon(booking.amount)}`, `사유: ${reason}`]).catch(() => false);
  return { state: "refunded", message, booking: bookingSummary(booking) };
}
/**
 * The single place a payment becomes a confirmed booking. Called by the browser after the payment window closes, by the
 * mobile redirect page and by the PortOne webhook; it is safe to call any number of times for the same payment.
 * Nothing from the caller is trusted except the payment ID: status and amount are read back from PortOne.
 */
export async function completePayment(paymentId: unknown): Promise<PaymentResult> {
  const bookingId = bookingIdFromPayment(paymentId);
  if (!bookingId || typeof paymentId !== "string") throw new HttpError(400, "결제 정보를 확인할 수 없어요.");
  let booking = await getBooking(bookingId);
  const settled = (b: Booking) => (b.status === "confirmed" || b.status === "done") && b.paymentId === paymentId;
  if (settled(booking)) return { state: "paid", booking: bookingSummary(booking) };
  const payment = await fetchPayment(paymentId);
  if (payment?.status !== "PAID") return { state: payment && ["FAILED", "CANCELLED"].includes(payment.status ?? "") ? "failed" : "pending", booking: bookingSummary(booking) };
  if (payment.amount?.total !== booking.amount || (payment.currency && payment.currency !== "KRW"))
    return refund(booking, paymentId, "결제 금액이 주문 금액과 일치하지 않음", "결제 금액이 신청 내용과 달라 결제를 자동으로 취소했어요. 다시 신청해 주세요.");
  const confirmed = await confirmPaid(bookingId, paymentId);
  if (confirmed) return { state: "paid", booking: bookingSummary(confirmed) };
  // Not confirmed by this call: a parallel call won, the order was already paid by another attempt, or it can no longer be honoured.
  booking = await getBooking(bookingId);
  if (settled(booking)) return { state: "paid", booking: bookingSummary(booking) };
  if (booking.status === "confirmed" || booking.status === "done")
    return refund(booking, paymentId, "이미 결제된 주문의 중복 결제", "이미 결제가 완료된 신청이라 중복 결제를 자동으로 취소했어요.");
  return refund(booking, paymentId, booking.status === "expired" ? "결제 기한이 지나 상담 시간이 마감됨" : "취소된 주문에 대한 결제",
    booking.product === "consultation" ? "결제가 늦어져 선택한 상담 시간이 마감됐어요. 결제는 자동으로 취소했으니 다른 시간으로 다시 예약해 주세요." : "취소된 신청이라 결제를 자동으로 취소했어요. 다시 신청해 주세요.");
}
/** A refund made in the PortOne console (or by API) cancels the booking here too and reopens its slot. */
async function syncCancelled(paymentId: string) {
  const bookingId = bookingIdFromPayment(paymentId);
  if (!bookingId) return;
  const booking = await getBooking(bookingId);
  if (booking.paymentId !== paymentId || booking.status !== "confirmed") return;
  if ((await fetchPayment(paymentId))?.status === "CANCELLED") await updateBooking(bookingId, { status: "cancelled" });
}
/**
 * PortOne webhook (register https://mykkachi.com/api/payments/webhook in the console).
 * The body only tells us which payment changed; the outcome always comes from the PortOne API, so a forged call can do no more than trigger a lookup.
 * When PORTONE_WEBHOOK_SECRET is set the Standard Webhooks signature is checked as well.
 */
export async function handlePaymentWebhook(request: Request) {
  const body = await request.text();
  const secret = runtime().PORTONE_WEBHOOK_SECRET;
  if (secret) {
    try {
      new Webhook(secret).verify(body, Object.fromEntries(["webhook-id", "webhook-timestamp", "webhook-signature"].map((h) => [h, request.headers.get(h) || ""])));
    } catch {
      return Response.json({ error: "invalid signature" }, { status: 400 });
    }
  }
  let event: { type?: unknown; data?: { paymentId?: unknown } };
  try { event = JSON.parse(body); } catch { return Response.json({ error: "invalid body" }, { status: 400 }); }
  const paymentId = event?.data?.paymentId;
  // Console test deliveries and payments that are not ours are acknowledged so PortOne does not retry them.
  if (typeof paymentId !== "string" || !bookingIdFromPayment(paymentId)) return Response.json({ ok: true, ignored: true });
  try {
    if (event.type === "Transaction.Paid") await completePayment(paymentId);
    else if (event.type === "Transaction.Cancelled") await syncCancelled(paymentId);
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof HttpError && e.status < 500) return Response.json({ ok: true, ignored: true });
    console.error("payment webhook failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "retry" }, { status: 500 });
  }
}
