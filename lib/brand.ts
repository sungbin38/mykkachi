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
  slogan: "시간이 걸리더라도, 제대로 봐드리겠습니다",
  chinese: "聽你說故事，陪你看明天",
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
