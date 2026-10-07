import assert from "node:assert/strict";
import { test } from "node:test";
import { notifyOwner, notificationConfigured, type Booking } from "../lib/booking";

const booking: Booking = {
  id: "email-regression", locale: "ko", product: "consultation", slotId: "slot-test",
  date: "2030-01-02", hour: 10, name: "테스트 신청자", email: "customer@example.invalid",
  phone: "010-0000-0000", birthDate: "1990-02-03", birthTime: "14:35", birthUnknown: false,
  calendar: "lunar", gender: "female", topic: "관계", story: "첫 번째 질문입니다.\n두 번째 질문도 함께 보냅니다.",
  depositName: "테스트 입금자", amount: 150000, marketingConsent: true, status: "requested",
  holdUntil: "2030-01-01T01:30:00.000Z", createdAt: "2030-01-01T01:00:00.000Z",
  updatedAt: "2030-01-01T01:00:00.000Z", paidAt: null, note: null, reportSentAt: null, seenAt: null,
  visitorId: null, sessionId: null, source: { utmSource: "threads", utmCampaign: "new-year", landingPath: "/book" },
};

test("owner notifications include all booking inputs and keep customer messages separate", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    const mail = JSON.parse(String(init?.body)) as { to: string[]; text: string; subject: string };
    messages.push(mail);
    return Response.json({ id: "mock-email" });
  });
  const keys = ["RESEND_API_KEY", "NOTIFY_EMAIL"] as const;
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  const messages: { to: string[]; text: string; subject: string }[] = [];
  process.env.RESEND_API_KEY = "test-only-never-sent";
  process.env.NOTIFY_EMAIL = "sungbin3833@gmail.com";
  assert.equal(notificationConfigured(), true);
  await notifyOwner(booking);
  assert.equal(messages.length, 2);
  assert.deepEqual(messages[0].to, ["sungbin3833@gmail.com"]);
  for (const field of [
    "예약번호: email-regression", "접수 시각: 2030-01-01T01:00:00.000Z", "신청 언어: 한국어",
    "2030-01-02", "10:00–11:00", "한국시간 KST", "이름: 테스트 신청자",
    "이메일: customer@example.invalid", "연락처: 010-0000-0000", "성별: 여성",
    "생년월일: 1990-02-03", "양력/음력: 음력", "태어난 시간: 14:35", "상담 주제: 관계",
    booking.story!, "입금자명: 테스트 입금자", "150,000", "후기 활용 동의: 동의 (할인 적용)",
    booking.holdUntil!, "threads · new-year · /book", "https://mykkachi.com/admin",
  ]) assert.ok(messages[0].text.includes(field), `Missing owner field: ${field}`);
  assert.deepEqual(messages[1].to, [booking.email]);
  assert.ok(!messages[1].text.includes(booking.story!));

  // Report applications have no slot; unknown birth time and declined consent must be explicit.
  messages.length = 0;
  delete process.env.NOTIFY_EMAIL;
  await notifyOwner({ ...booking, locale: "zh-TW", product: "report", slotId: null, date: null, hour: null,
    gender: "male", calendar: "solar", birthUnknown: true, birthTime: null, marketingConsent: false,
    depositName: null, topic: null, source: null });
  assert.deepEqual(messages[0].to, ["sungbin3833@gmail.com"]);
  for (const field of ["PDF 리포트", "대만 번체", "성별: 남성", "양력/음력: 양력",
    "태어난 시간: 시간 모름", "후기 활용 동의: 미동의", "입금자명: 테스트 신청자", "상담 주제: 미입력"])
    assert.ok(messages[0].text.includes(field), `Missing report field: ${field}`);
  assert.ok(!messages[0].text.includes("null"));
  assert.ok(messages[1].subject.includes("已收到你的申請"));
  delete process.env.RESEND_API_KEY;
  assert.equal(notificationConfigured(), false);
});
