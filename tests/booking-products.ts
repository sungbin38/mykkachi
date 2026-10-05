import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { neon, neonConfig } from "@neondatabase/serverless";
import { createBooking, validateBooking, updateBooking, releaseExpired, listBookings, type BookingInput } from "../lib/booking";
import { priceFor } from "../lib/booking-shared";
import { db } from "../lib/db";

// Isolate every query in a temporary schema, and never send test notifications.
delete process.env.RESEND_API_KEY;
delete process.env.NOTIFY_EMAIL;
const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!, { fullResults: true });
const schema = `booking_test_${crypto.randomUUID().replaceAll("-", "")}`;
const migration = (await readFile(new URL("../db/005_report_product.sql", import.meta.url), "utf8")).split(";").map(s => s.trim()).filter(Boolean);
const input = { name: "상품 검증", email: "product-test@example.invalid", phone: "010-0000-0000", birthDate: "1990-01-01", birthUnknown: true, gender: "female", story: "리포트 상품 신청과 예약 시간 분리를 확인하는 테스트입니다.", calendar: "solar" };
const originalFetch = neonConfig.fetchFunction;
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
  assert.deepEqual([priceFor(false), priceFor(true), priceFor(false, "report"), priceFor(true, "report")], [200000, 150000, 100000, 50000]);
  assert.throws(() => validateBooking({ ...input, product: "wrong" }));
  assert.throws(() => validateBooking({ ...input, product: "consultation" }));
  assert.equal(validateBooking({ ...input, slotId: "legacy-slot" }).product, "consultation");

  for (const consent of [false, true]) {
    const report = await createBooking(validateBooking({ ...input, product: "report", marketingConsent: consent, slotId: "should-be-ignored", amount: 1 }));
    assert.equal(report.amount, consent ? 50000 : 100000);
    assert.equal(report.product, "report");
    assert.equal(report.slotId, null);
    assert.equal(report.date, null);
    assert.equal(report.hour, null);
    assert.equal((await db().prepare("SELECT count(*)::int AS n FROM booking_slots").first<{ n: number }>())?.n, 0);
    assert.equal((await updateBooking(report.id, { status: "confirmed" })).status, "confirmed");
    assert.ok((await updateBooking(report.id, { reportSent: true })).reportSentAt);
    await updateBooking(report.id, { status: "cancelled" });
    await updateBooking(report.id, { status: "requested" });
    await db().prepare("UPDATE bookings SET hold_until=now()-interval '1 minute' WHERE id=?").bind(report.id).run();
    assert.equal(await releaseExpired(), 1);
  }
  await db().prepare("INSERT INTO booking_slots (id,date,hour) VALUES ('test-slot','2099-01-01',10),('fail-slot','2099-01-02',10)").run();
  const consultation = validateBooking({ ...input, slotId: "test-slot", marketingConsent: true });
  const results = await Promise.allSettled([createBooking(consultation), createBooking(consultation)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  const successful = results.find(r => r.status === "fulfilled");
  assert.ok(successful?.status === "fulfilled");
  assert.equal(successful.value.amount, 150000);
  assert.equal(successful.value.slotId, "test-slot");
  await updateBooking(successful.value.id, { status: "cancelled" });
  assert.equal((await db().prepare("SELECT status FROM booking_slots WHERE id='test-slot'").first<{ status: string }>())?.status, "open");
  await assert.rejects(createBooking({ ...consultation, slotId: "fail-slot", name: null } as unknown as BookingInput));
  assert.equal((await db().prepare("SELECT status FROM booking_slots WHERE id='fail-slot'").first<{ status: string }>())?.status, "open");
  assert.equal((await listBookings()).length, 4);
  console.log("PASS migration twice, legacy records, 4 prices, server validation, slot-free reports, expiry, admin updates, consultation concurrency and rollback");
} finally {
  neonConfig.fetchFunction = originalFetch;
  await sql.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
}
