// Client-safe constants shared by the booking form, emails and the admin studio.
export const BOOKING_TOPICS = ["나를 이해하기", "연애와 관계", "일과 진로", "가족 이야기", "마음과 일상", "올해의 흐름"] as const;
/** Hours an admin may open: 09:00 through the 22:00–23:00 slot. */
export const BOOKING_HOURS = Array.from({ length: 14 }, (_, i) => 9 + i);
/** Default opening hours: weekdays 18:00–23:00, weekends 12:00–23:00 (each slot is one hour, so the last slot starts at 22). */
export const DEFAULT_HOURS_LABEL = "평일 18–23시 · 주말 12–23시";
export const defaultHoursFor = (date: string): number[] => {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  const weekend = day === 0 || day === 6;
  return BOOKING_HOURS.filter((h) => h >= (weekend ? 12 : 18) && h <= 22);
};
export const BOOKING_STATUSES = ["requested", "confirmed", "done", "cancelled", "expired"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export const STATUS_LABEL: Record<BookingStatus, string> = { requested: "결제 대기", confirmed: "결제 완료·확정", done: "상담 완료", cancelled: "취소", expired: "기한 만료" };
export const PRICE_BASE = 200000;
export const PRICE_MARKETING = 150000;
export const BOOKING_PRODUCTS = {
  consultation: { name: "1:1 사주 상담", base: PRICE_BASE, marketing: PRICE_MARKETING },
  report: { name: "사주 리포트", base: 100000, marketing: 50000 },
} as const;
export type BookingProduct = keyof typeof BOOKING_PRODUCTS;
/** November special for the report-only product. Ends at midnight KST on Dec 1; regular prices return automatically after that. */
export const REPORT_PROMO = { label: "11월 특가", endsAt: "2026-12-01T00:00:00+09:00", base: 10000, marketing: 5000 } as const;
export const REPORT_PROMO_END = Date.parse(REPORT_PROMO.endsAt);
export const reportPromoActive = (now = Date.now()) => now < REPORT_PROMO_END;
/** Prices in effect right now; `regular` is the list price shown struck through during a promotion. */
export const offerFor = (product: BookingProduct, now = Date.now()) => {
  const p = BOOKING_PRODUCTS[product];
  return product === "report" && reportPromoActive(now)
    ? { name: p.name, base: REPORT_PROMO.base as number, marketing: REPORT_PROMO.marketing as number, regular: p.base as number, promo: true }
    : { name: p.name, base: p.base as number, marketing: p.marketing as number, regular: p.base as number, promo: false };
};
/** Base price; the marketing-consent discount applies only when the customer opts in. */
export const PRICE = PRICE_BASE;
export const priceFor = (marketingConsent: boolean, product: BookingProduct = "consultation") =>
  marketingConsent ? offerFor(product).marketing : offerFor(product).base;
export const bookingStatusLabel = (status: BookingStatus, product: BookingProduct = "consultation") =>
  product === "report" && status === "done" ? "리포트 완료" : STATUS_LABEL[status];
/** Optional, discounted: lets us reuse the consultation story anonymously. Marketing contact itself is part of the required agreement (CONTACT_CONSENT_TEXT). */
export const MARKETING_CONSENT_TEXT = "상담 또는 리포트에 담긴 사연과 풀이를 이름과 개인정보 없이 마케팅용 후기·콘텐츠에 활용하는 데 동의합니다.";
/** Required for every booking: data use plus marketing email/phone contact from My Kkachi. */
export const CONTACT_CONSENT_TEXT = "입력한 정보는 상담 예약·리포트 신청·결제 확인·리포트 발송에 사용하고, 남긴 이메일과 연락처로 돈쌤의 소식·이벤트 안내를 보내드려요. 안내 수신은 언제든 답장으로 거절할 수 있고, 이용 뒤 요청하시면 정보를 지워드려요. 동의합니다. *";
export const DURATION_TEXT = "최대 1시간 (이야기가 정리되면 더 일찍 끝날 수도 있어요)";
export const STORY_EXAMPLES: { title: string; text: string }[] = [
  { title: "이직 · 커리어", text: "IT 회사에서 기획 일을 5년 했고, 지금 32살이에요. 올해 초부터 회사가 구조조정 이야기가 나와서 불안한데, 마침 규모가 더 작은 스타트업에서 팀장 자리로 제안이 왔어요. 연봉은 비슷하고 일은 훨씬 많아질 것 같아요. 지금이 움직여도 되는 시기인지, 아니면 1~2년 더 버티는 게 나은지 알고 싶어요." },
  { title: "연애 · 궁합", text: "2년 만난 남자친구와 결혼 이야기가 나오고 있어요. 저는 1995년 3월 12일 오전 7시 여성, 남자친구는 1993년 11월 2일 오후 3시 남성이에요. 요즘 돈 쓰는 방식이랑 양가 문제로 자주 부딪히는데, 이게 맞춰갈 수 있는 차이인지 궁금하고 결혼 시기를 잡는다면 언제가 좋을지도 듣고 싶어요." },
  { title: "사업 · 돈", text: "작년에 다니던 회사를 그만두고 온라인 쇼핑몰을 시작했어요. 첫 6개월은 괜찮았는데 올여름부터 매출이 반으로 줄어서 대출을 더 받을지 접을지 고민이에요. 제 사주에서 재물 흐름이 언제 풀리는지, 지금 확장하는 게 맞는지 솔직하게 듣고 싶어요." },
  { title: "가족 · 자녀", text: "고등학교 2학년 아들이 갑자기 미대 입시를 하고 싶다고 해요. 저는 공무원 쪽을 바랐는데 반대만 하다 보니 대화가 끊겼어요. 아이는 2009년 8월 20일 오전 10시 남자아이예요. 아이 기질에 그 길이 맞는지, 엄마인 제가 어떻게 받아들이면 좋을지 알고 싶어요." },
];
export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
/** Required before every card payment. */
export const TERMS_CONSENT_TEXT = "이용약관 및 환불정책에 동의합니다.";
/** Required for the report product only (전자상거래법 제17조 제2항: 개별 제작 콘텐츠의 청약철회 제한 고지). */
export const WITHDRAWAL_CONSENT_TEXT = "리포트는 개별 제작 콘텐츠로, 작성이 시작되면 청약철회가 제한됨을 확인합니다.";
export const REFUND_SUMMARY = {
  consultation: "1:1 상담은 상담 시작 전까지 취소하면 전액 환불됩니다. 상담이 진행된 뒤에는 환불되지 않습니다.",
  report: "리포트는 작성을 시작하기 전까지 취소하면 전액 환불됩니다. 개별 제작 콘텐츠라 작성이 시작된 뒤에는 청약철회가 제한됩니다.",
} as const;
/** An unpaid order holds its consultation slot this long before it is released. */
export const PAYMENT_HOLD_MINUTES = 30;
// PortOne V2 identifiers are public (they ship in the browser bundle). The defaults are the test channel; set the env vars to switch to the live channel after the PG contract.
export const PORTONE = {
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "store-bac0d60e-1790-40d4-bb56-7c9fdfb04cf3",
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "channel-key-f7f92624-d0cc-455d-9a49-89b07336c5b0",
};
// A payment ID is the booking UUID without hyphens plus a per-attempt suffix, so every attempt is unique and any attempt maps back to its order.
export const newPaymentId = (bookingId: string) => `${bookingId.replaceAll("-", "")}-${Date.now().toString(36)}`;
export const bookingIdFromPayment = (paymentId: unknown) => {
  const m = typeof paymentId === "string" ? /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})-[a-z0-9]{1,16}$/.exec(paymentId) : null;
  return m ? m.slice(1).join("-") : null;
};
/** What the browser may know about an order: enough to pay for it and to show the confirmation. */
export type BookingSummary = { id: string; product: BookingProduct; date: string | null; hour: number | null; name: string; email: string; amount: number; marketingConsent: boolean; orderName: string };
