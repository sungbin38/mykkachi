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
export const STATUS_LABEL: Record<BookingStatus, string> = { requested: "입금 대기", confirmed: "입금 확인·확정", done: "상담 완료", cancelled: "취소", expired: "기한 만료" };
export const PRICE_BASE = 200000;
export const PRICE_MARKETING = 150000;
export const BOOKING_PRODUCTS = {
  consultation: { name: "1:1 사주 상담", base: PRICE_BASE, marketing: PRICE_MARKETING },
  report: { name: "사주 리포트", base: 100000, marketing: 50000 },
} as const;
export type BookingProduct = keyof typeof BOOKING_PRODUCTS;
/** Base price; the marketing-consent discount applies only when the customer opts in. */
export const PRICE = PRICE_BASE;
export const priceFor = (marketingConsent: boolean, product: BookingProduct = "consultation") =>
  marketingConsent ? BOOKING_PRODUCTS[product].marketing : BOOKING_PRODUCTS[product].base;
export const bookingStatusLabel = (status: BookingStatus, product: BookingProduct = "consultation") =>
  product === "report" && status === "done" ? "리포트 완료" : STATUS_LABEL[status];
/** Optional, discounted: lets us reuse the consultation story anonymously. Marketing contact itself is part of the required agreement (CONTACT_CONSENT_TEXT). */
export const MARKETING_CONSENT_TEXT = "상담 또는 리포트에 담긴 사연과 풀이를 이름과 개인정보 없이 마케팅용 후기·콘텐츠에 활용하는 데 동의합니다.";
/** Required for every booking: data use plus marketing email/phone contact from My Kkachi. */
export const CONTACT_CONSENT_TEXT = "입력한 정보는 상담 예약·리포트 신청·입금 확인·리포트 발송에 사용하고, 남긴 이메일과 연락처로 돈쌤의 소식·이벤트 안내를 보내드려요. 안내 수신은 언제든 답장으로 거절할 수 있고, 이용 뒤 요청하시면 정보를 지워드려요. 동의합니다. *";
export const DURATION_TEXT = "최대 1시간 (이야기가 정리되면 더 일찍 끝날 수도 있어요)";
export const STORY_EXAMPLES: { title: string; text: string }[] = [
  { title: "이직 · 커리어", text: "IT 회사에서 기획 일을 5년 했고, 지금 32살이에요. 올해 초부터 회사가 구조조정 이야기가 나와서 불안한데, 마침 규모가 더 작은 스타트업에서 팀장 자리로 제안이 왔어요. 연봉은 비슷하고 일은 훨씬 많아질 것 같아요. 지금이 움직여도 되는 시기인지, 아니면 1~2년 더 버티는 게 나은지 알고 싶어요." },
  { title: "연애 · 궁합", text: "2년 만난 남자친구와 결혼 이야기가 나오고 있어요. 저는 1995년 3월 12일 오전 7시 여성, 남자친구는 1993년 11월 2일 오후 3시 남성이에요. 요즘 돈 쓰는 방식이랑 양가 문제로 자주 부딪히는데, 이게 맞춰갈 수 있는 차이인지 궁금하고 결혼 시기를 잡는다면 언제가 좋을지도 듣고 싶어요." },
  { title: "사업 · 돈", text: "작년에 다니던 회사를 그만두고 온라인 쇼핑몰을 시작했어요. 첫 6개월은 괜찮았는데 올여름부터 매출이 반으로 줄어서 대출을 더 받을지 접을지 고민이에요. 제 사주에서 재물 흐름이 언제 풀리는지, 지금 확장하는 게 맞는지 솔직하게 듣고 싶어요." },
  { title: "가족 · 자녀", text: "고등학교 2학년 아들이 갑자기 미대 입시를 하고 싶다고 해요. 저는 공무원 쪽을 바랐는데 반대만 하다 보니 대화가 끊겼어요. 아이는 2009년 8월 20일 오전 10시 남자아이예요. 아이 기질에 그 길이 맞는지, 엄마인 제가 어떻게 받아들이면 좋을지 알고 싶어요." },
];
export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
// Bank details are shown to customers after booking, so NEXT_PUBLIC_ is intentional.
export const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME || "하나은행",
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "56991041952707",
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "안성빈",
};
export const bankConfigured = () => BANK.account.length > 0;
// Digits only, for clipboard and bank-app paste.
export const bankAccountDigits = () => BANK.account.replace(/\D/g, "");
// Hyphenated for reading. Hana Bank accounts group as 3-6-5 (14 digits) or 3-6-3 (12 digits); other lengths keep the configured value.
export const bankAccountDisplay = () => {
  const d = bankAccountDigits();
  if (d.length === 14 || d.length === 12) return `${d.slice(0, 3)}-${d.slice(3, 9)}-${d.slice(9)}`;
  return BANK.account;
};
