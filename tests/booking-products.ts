import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { neon, neonConfig } from "@neondatabase/serverless";
import { createBooking, confirmPaid, expireUnpaid, getBooking, validateBooking, updateBooking, listBookings, type BookingInput } from "../lib/booking";
import { offerFor, priceFor, REPORT_PROMO_END } from "../lib/booking-shared";
import { completePayment, handlePaymentWebhook } from "../lib/payments";
import { db } from "../lib/db";

// Isolate every query in a temporary schema, and never send test notifications.
delete process.env.RESEND_API_KEY;
delete process.env.NOTIFY_EMAIL;
const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!, { fullResults: true });
const schema = `booking_test_${crypto.randomUUID().replaceAll("-", "")}`;
const migration = (await Promise.all(["005_report_product.sql", "006_booking_locale.sql", "014_portone_payments.sql"].map(file => readFile(new URL(`../db/${file}`, import.meta.url), "utf8")))).join(";\n").split(";").map(s => s.trim()).filter(Boolean);
const input = { name: "상품 검증", email: "product-test@example.invalid", phone: "010-0000-0000", birthDate: "1990-01-01", birthUnknown: true, gender: "female", story: "리포트 상품 신청과 예약 시간 분리를 확인하는 테스트입니다.", calendar: "solar", termsAgreed: true, withdrawalAgreed: true };
const originalFetch = neonConfig.fetchFunction;
const networkFetch = globalThis.fetch;
const emails: { to: string[]; text: string; reply_to: string }[] = [];
process.env.RESEND_API_KEY = "test-only-never-sent";
// PortOne is replaced by an in-memory ledger: lookups read it, cancellations mark it.
process.env.PORTONE_API_SECRET = "test-only-never-sent";
delete process.env.PORTONE_WEBHOOK_SECRET;
const ledger = new Map<string, { status: string; amount: { total: number }; currency: string }>();
const refunds: string[] = [];
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith("https://api.portone.io/payments/")) {
    const [id, action] = String(url).slice("https://api.portone.io/payments/".length).split("/");
    const payment = ledger.get(decodeURIComponent(id));
    if (!payment) return new Response(JSON.stringify({ type: "PAYMENT_NOT_FOUND" }), { status: 404 });
    if (action === "cancel") { refunds.push(id); payment.status = "CANCELLED"; return Response.json({ cancellation: { status: "SUCCEEDED" } }); }
    return Response.json(payment);
  }
  if (String(url) === "https://api.resend.com/emails") {
    emails.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: "mock-mail" }), { status: 200 });
  }
  return networkFetch(url, init);
};
try {
  await sql.query(`CREATE SCHEMA ${schema}`);
  // Clone schema only, with a synthetic pre-migration consultation record.
  await sql.transaction([
    sql.query(`SET LOCAL search_path TO ${schema}`),
    sql.query("CREATE TABLE booking_slots (LIKE public.booking_slots INCLUDING ALL)"),
    sql.query("CREATE TABLE bookings (LIKE public.bookings INCLUDING ALL)"),
    sql.query("INSERT INTO bookings (id,slot_id,date,hour,name,email,birth_date,topic) VALUES ('legacy','legacy-slot','2030-01-01',10,'legacy','legacy@example.invalid','1990-01-01','test')"),
    ...migration.map(s => sql.query(s)),
    ...migration.map(s => sql.query(s)),
  ]);
  // Add a transaction-local search_path while keeping the app's real SQL and bindings.
  neonConfig.fetchFunction = async (url: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    const queries = [{ query: `SET LOCAL search_path TO ${schema}`, params: [] }, ...(body.queries ?? [body])];
    const response = await fetch(url, { ...init, body: JSON.stringify({ queries }) });
    if (!response.ok) return response;
    const result = await response.json();
    return new Response(JSON.stringify(body.queries ? { results: result.results.slice(1) } : result.results[1]), { status: response.status, headers: { "Content-Type": "application/json" } });
  };
  assert.equal((await db().prepare("SELECT product FROM bookings WHERE id='legacy'").first<{ product: string }>())?.product, "consultation");
  assert.deepEqual([priceFor(false), priceFor(true)], [200000, 150000]);
  assert.deepEqual([offerFor("report", REPORT_PROMO_END - 1).base, offerFor("report", REPORT_PROMO_END - 1).marketing, offerFor("report", REPORT_PROMO_END - 1).regular], [10000, 5000, 100000]);
  assert.deepEqual([offerFor("report", REPORT_PROMO_END).base, offerFor("report", REPORT_PROMO_END).marketing], [100000, 50000]);
  assert.throws(() => validateBooking({ ...input, product: "wrong" }));
  assert.throws(() => validateBooking({ ...input, product: "consultation" }));
  assert.throws(() => validateBooking({ ...input, slotId: "legacy-slot", termsAgreed: false }));
  assert.throws(() => validateBooking({ ...input, product: "report", withdrawalAgreed: false }));
  assert.equal(validateBooking({ ...input, slotId: "legacy-slot", withdrawalAgreed: false }).product, "consultation");
  assert.equal(validateBooking({ ...input, slotId: "legacy-slot" }).product, "consultation");

  for (const consent of [false, true]) {
    const report = await createBooking(validateBooking({ ...input, product: "report", locale: "zh-TW", marketingConsent: consent, slotId: "should-be-ignored", amount: 1 }));
    assert.equal(report.amount, priceFor(consent, "report"));
    assert.equal(report.product, "report");
    assert.equal(report.locale, "zh-TW");
    assert.equal(report.slotId, null);
    assert.equal(report.date, null);
    assert.equal(report.hour, null);
    assert.equal((await db().prepare("SELECT count(*)::int AS n FROM booking_slots").first<{ n: number }>())?.n, 0);
    assert.equal((await updateBooking(report.id, { status: "confirmed" })).status, "confirmed");
    assert.ok((await updateBooking(report.id, { reportSent: true })).reportSentAt);
    await updateBooking(report.id, { status: "cancelled" });
    assert.ok(report.holdUntil && report.termsAgreedAt);
    const restored = await updateBooking(report.id, { status: "requested" });
    assert.deepEqual([restored.status, restored.holdUntil], ["requested", null]);
  }
  await db().prepare("INSERT INTO booking_slots (id,date,hour) VALUES ('test-slot','2099-01-01',10),('fail-slot','2099-01-02',10)").run();
  const consultation = validateBooking({ ...input, slotId: "test-slot", locale: "zh-TW", marketingConsent: true });
  const results = await Promise.allSettled([createBooking(consultation), createBooking(consultation)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  const successful = results.find(r => r.status === "fulfilled");
  assert.ok(successful?.status === "fulfilled");
  assert.equal(successful.value.amount, 150000);
  assert.equal(successful.value.slotId, "test-slot");
  assert.equal(successful.value.locale, "zh-TW");
  assert.equal(successful.value.date, "2099-01-01");
  assert.equal(successful.value.hour, 10);
  // Nothing is mailed until the card payment is verified; then exactly once.
  assert.equal(emails.length, 0);
  const paid = await confirmPaid(successful.value.id, "pay-1");
  assert.deepEqual([paid?.status, paid?.paymentId, !!paid?.paidAt], ["confirmed", "pay-1", true]);
  assert.equal(await confirmPaid(successful.value.id, "pay-2"), null);
  assert.equal(emails.length, 2);
  assert.ok(emails.some(mail => mail.text.includes("09:00–10:00") && mail.text.includes("UTC+8") && mail.text.includes("150,000 韓元")));
  assert.ok(emails.every(mail => mail.reply_to === "hello@mykkachi.com"));
  await updateBooking(successful.value.id, { status: "cancelled" });
  assert.equal((await db().prepare("SELECT status FROM booking_slots WHERE id='test-slot'").first<{ status: string }>())?.status, "open");
  assert.equal(await confirmPaid(successful.value.id, "pay-3"), null);
  // An unpaid order past its hold expires and frees the slot; a late payment revives it only while the slot is still free.
  const late = await createBooking(consultation);
  await db().prepare("UPDATE bookings SET hold_until=now() - interval '1 minute' WHERE id=?").bind(late.id).run();
  await expireUnpaid();
  assert.equal((await getBooking(late.id)).status, "expired");
  assert.equal((await db().prepare("SELECT status FROM booking_slots WHERE id='test-slot'").first<{ status: string }>())?.status, "open");
  assert.equal((await confirmPaid(late.id, "pay-late"))?.status, "confirmed");
  assert.equal((await db().prepare("SELECT status FROM booking_slots WHERE id='test-slot'").first<{ status: string }>())?.status, "booked");
  await updateBooking(late.id, { status: "cancelled" });
  const lost = await createBooking(consultation);
  await db().prepare("UPDATE bookings SET hold_until=now() - interval '1 minute' WHERE id=?").bind(lost.id).run();
  await expireUnpaid();
  // Resubmitting after an abandoned payment releases the earlier attempt and its slot.
  const first = await createBooking(consultation);
  const second = await createBooking({ ...consultation, replaces: first.id });
  assert.deepEqual([(await getBooking(first.id)).status, second.slotId], ["cancelled", "test-slot"]);
  assert.equal(await confirmPaid(lost.id, "pay-lost"), null);
  await updateBooking(second.id, { status: "cancelled" });
  await assert.rejects(createBooking({ ...consultation, slotId: "fail-slot", name: null } as unknown as BookingInput));
  assert.equal((await db().prepare("SELECT status FROM booking_slots WHERE id='fail-slot'").first<{ status: string }>())?.status, "open");
  // Payment verification end to end against the ledger: status and amount come from PortOne, never from the caller.
  const order = await createBooking(validateBooking({ ...input, product: "report", marketingConsent: true }));
  const pay = (n: number) => `${order.id.replaceAll("-", "")}-t${n}`;
  const paidStatus = (total: number) => ({ status: "PAID", amount: { total }, currency: "KRW" });
  await assert.rejects(completePayment("not-ours"));
  assert.equal((await completePayment(pay(1))).state, "pending");
  ledger.set(pay(1), { ...paidStatus(order.amount), status: "FAILED" });
  assert.equal((await completePayment(pay(1))).state, "failed");
  ledger.set(pay(2), paidStatus(order.amount - 1));
  assert.equal((await completePayment(pay(2))).state, "refunded");
  assert.deepEqual([refunds.length, (await getBooking(order.id)).status], [1, "requested"]);
  ledger.set(pay(3), paidStatus(order.amount));
  const mailsBefore = emails.length;
  const both = await Promise.all([completePayment(pay(3)), completePayment(pay(3))]);
  assert.deepEqual(both.map(r => r.state), ["paid", "paid"]);
  assert.equal((await completePayment(pay(3))).booking.amount, order.amount);
  assert.equal(emails.length, mailsBefore + 2);
  assert.deepEqual([(await getBooking(order.id)).status, (await getBooking(order.id)).paymentId, refunds.length], ["confirmed", pay(3), 1]);
  ledger.set(pay(4), paidStatus(order.amount));
  assert.equal((await completePayment(pay(4))).state, "refunded");
  assert.deepEqual([refunds.length, (await getBooking(order.id)).paymentId], [2, pay(3)]);
  const hook = (type: string, paymentId: string) => handlePaymentWebhook(new Request("https://mykkachi.com/api/payments/webhook", { method: "POST", body: JSON.stringify({ type, data: { paymentId } }) }));
  assert.equal((await hook("Transaction.Paid", "console-test")).status, 200);
  assert.equal((await hook("Transaction.Paid", pay(3))).status, 200);
  assert.equal((await hook("Transaction.Cancelled", pay(3))).status, 200);
  assert.equal((await getBooking(order.id)).status, "confirmed");
  ledger.get(pay(3))!.status = "CANCELLED";
  await hook("Transaction.Cancelled", pay(3));
  assert.equal((await getBooking(order.id)).status, "cancelled");
  assert.equal((await listBookings()).length, 9);
  console.log("PASS migration twice, legacy records, 4 prices, consent validation, slot-free reports, payment confirmation once, unpaid expiry and revival, replaced attempts, PortOne verification (pending, failed, amount mismatch refund, idempotent confirm, duplicate refund, webhook cancel), admin updates, consultation concurrency and rollback");
} finally {
  neonConfig.fetchFunction = originalFetch;
  globalThis.fetch = networkFetch;
  await sql.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
}
