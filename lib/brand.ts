export type Locale = "ko" | "zh-TW";
export const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://mykkachi.com").replace(/\/$/, "");
export const homePath = (locale: Locale) => (locale === "ko" ? "/" : "/zh-TW");
export const localPath = (locale: Locale, path: string) =>
  `${locale === "ko" ? "" : "/zh-TW"}${path}`;
export const CONTACT_EMAIL = "hello@mykkachi.com";
export const BRAND = {
  name: "돈쌤",
  english: "DON SSAEM",
  handle: "mykkachi",
  taiwanHandle: "mykkachi.tw",
  slogan: "나를 알고 싶을 때, 내 사주에 물어봐요.",
  chinese: "想更了解自己時，問問自己的八字。",
};

// Shown in every footer. Card companies compare this with the business registration certificate character by character; do not reword.
export const BUSINESS = {
  name: "돈쌤",
  owner: "안성빈",
  registration: "611-56-01112",
  address: "경기도 고양시 일산동구 위시티4로 46, 206동 1502호 (식사동, 위시티 일산자이2단지)",
  phone: "010-9737-3833",
  email: "sungbin3833@gmail.com",
  mailOrder: "간이과세자 신고 면제",
};

// Owner's KakaoTalk channel (돈쌤). KAKAO_URL opens the 1:1 chat directly; the channel home is KAKAO_CHANNEL_URL.
export const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_xfeQxiX";
export const KAKAO_URL: string = `${KAKAO_CHANNEL_URL}/chat`;

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  alternateName: [BRAND.english, "돈쌤 사주", "Don 老師"],
  url: ORIGIN,
  inLanguage: ["ko-KR", "zh-Hant-TW"],
};

// Free self-reading entry points (section 05, nav, hero link). Off for now; the /read page itself stays reachable by URL.
export const FREE_READING_ENABLED = false;
