// Client-safe constants shared by the booking form, emails and the admin studio.
export const BOOKING_TOPICS = ["나를 이해하기", "연애와 관계", "일과 진로", "가족 이야기", "마음과 일상", "올해의 흐름"] as const;
export const BOOKING_HOURS = Array.from({ length: 13 }, (_, i) => 9 + i);
export const BOOKING_STATUSES = ["requested", "confirmed", "done", "cancelled", "expired"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export const STATUS_LABEL: Record<BookingStatus, string> = { requested: "입금 대기", confirmed: "입금 확인·확정", done: "상담 완료", cancelled: "취소", expired: "기한 만료" };
export const PRICE_BASE = 200000;
export const PRICE_MARKETING = 150000;
/** Base price; the marketing-consent discount applies only when the customer opts in. */
export const PRICE = PRICE_BASE;
export const priceFor = (marketingConsent: boolean) => (marketingConsent ? PRICE_MARKETING : PRICE_BASE);
export const MARKETING_CONSENT_TEXT = "마이까치의 소식·이벤트 안내를 받고, 상담 이야기를 이름과 개인정보 없이 후기·콘텐츠에 활용하는 데 동의합니다.";
export const DURATION_TEXT = "최대 1시간 (이야기가 정리되면 더 일찍 끝날 수도 있어요)";
export const HOLD_HOURS = 24;
export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
// Bank details are shown to customers after booking, so NEXT_PUBLIC_ is intentional.
export const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME || "하나은행",
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "",
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "",
};
export const bankConfigured = () => BANK.account.length > 0;
