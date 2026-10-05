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
export const HOLD_MINUTES = 30;
export const STORY_EXAMPLES: { title: string; text: string }[] = [
  { title: "이직 고민", text: "지금 이직 때문에 고민하고 있는 회사가 두 곳이에요. 한 곳은 아는 분이 대표라 안정적이고 편하게 적응할 수 있을 것 같고, 다른 한 곳은 업계에서 유명한 분과 일해볼 수 있지만 맡게 될 일이 꽤 어려워 보여요. 사주로 지금 시기에 어떤 환경이 저한테 더 잘 맞는지 알 수 있을까요?" },
  { title: "관계", text: "3년 만난 사람과 결혼 이야기가 나오는데, 요즘 자주 부딪혀요. 서로 성향이 많이 다른 것 같은데 이게 맞춰갈 수 있는 차이인지, 제가 어떤 부분을 조심하면 좋을지 궁금해요." },
  { title: "요즘 마음", text: "특별히 큰일은 없는데 몇 달째 무기력하고 뭘 해도 재미가 없어요. 올해 제 흐름이 어떤지, 지금은 쉬어가야 하는 때인지 움직여야 하는 때인지 듣고 싶어요." },
];
export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
// Bank details are shown to customers after booking, so NEXT_PUBLIC_ is intentional.
export const BANK = {
  name: process.env.NEXT_PUBLIC_BANK_NAME || "하나은행",
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "",
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "",
};
export const bankConfigured = () => BANK.account.length > 0;
// Digits only, for clipboard and bank-app paste.
export const bankAccountDigits = () => BANK.account.replace(/\D/g, "");
// Hyphenated for reading. Hana Bank 14-digit accounts group as 3-6-5; other lengths keep the configured value.
export const bankAccountDisplay = () => {
  const d = bankAccountDigits();
  if (d.length === 14) return `${d.slice(0, 3)}-${d.slice(3, 9)}-${d.slice(9)}`;
  return BANK.account;
};
