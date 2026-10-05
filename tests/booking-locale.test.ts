import test from "node:test";
import assert from "node:assert/strict";
import { bookingSlotLocal, bookingSlotLabel, bookingMoney } from "../lib/booking-locale";
test("KST slots display one hour earlier in Taiwan without changing the source", () => {
  assert.deepEqual(bookingSlotLocal("2026-10-05", 18, "ko"), { date: "2026-10-05", start: "18:00", end: "19:00" });
  assert.deepEqual(bookingSlotLocal("2026-10-05", 18, "zh-TW"), { date: "2026-10-05", start: "17:00", end: "18:00" });
  assert.deepEqual(bookingSlotLocal("2027-01-01", 0, "zh-TW"), { date: "2026-12-31", start: "23:00", end: "00:00" });
  assert.match(bookingSlotLabel("2026-10-05", 18, "zh-TW"), /17:00–18:00.*UTC\+8/);
  assert.equal(bookingMoney(150000, "zh-TW"), "150,000 韓元");
});
