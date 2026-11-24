// Browser side of the card payment: open the PortOne window, then let the server verify the result.
import { localPath, type Locale } from "./brand";
import { newPaymentId, PORTONE, type BookingSummary } from "./booking-shared";

export type PendingOrder = BookingSummary & { phone: string; locale: Locale };
export type PayOutcome = { state: "paid" | "pending" | "failed" | "refunded" | "cancelled" | "redirecting"; message?: string; booking?: BookingSummary };
// The order survives the mobile redirect in sessionStorage so a failed payment can be retried without refilling the form.
const ORDER_KEY = "donssaem-pending-order";
export const DRAFT_KEY = "donssaem-booking-draft";
export const loadPending = (): PendingOrder | null => { try { return JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null"); } catch { return null; } };
export const clearPending = () => { try { sessionStorage.removeItem(ORDER_KEY); sessionStorage.removeItem(DRAFT_KEY); } catch {} };

/** Asks the server whether the payment went through. The server reads the status and amount from PortOne itself. */
export async function verifyPayment(paymentId: string): Promise<PayOutcome> {
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch("/api/payments/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
      const data = (await res.json()) as PayOutcome & { error?: string };
      if (!res.ok) return { state: "failed", message: data.error };
      if (data.state !== "pending") return data;
      await new Promise((r) => setTimeout(r, 1500));
    }
  } catch {}
  return { state: "pending" };
}
export async function requestCardPayment(order: PendingOrder): Promise<PayOutcome> {
  const paymentId = newPaymentId(order.id);
  try { sessionStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch {}
  const phone = order.phone.replace(/\D/g, "");
  const { default: PortOne } = await import("@portone/browser-sdk/v2");
  const res = await PortOne.requestPayment({
    storeId: PORTONE.storeId, channelKey: PORTONE.channelKey, paymentId,
    orderName: order.orderName, totalAmount: order.amount, currency: "CURRENCY_KRW", payMethod: "CARD",
    customer: { fullName: order.name, email: order.email, ...(/^01\d{8,9}$/.test(phone) ? { phoneNumber: phone } : {}) },
    // Mobile browsers leave the page and come back here with ?paymentId=…(&code=…&message=… on failure).
    redirectUrl: `${location.origin}${localPath(order.locale, "/book/complete")}`,
  });
  if (!res) return { state: "redirecting" };
  if (res.code !== undefined) return { state: "cancelled", message: res.message };
  return verifyPayment(paymentId);
}
