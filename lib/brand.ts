export type Locale = "ko" | "zh-TW";
export const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://mykkachi.vercel.app").replace(/\/$/, "");
export const homePath = (locale: Locale) => (locale === "ko" ? "/" : "/zh-TW");
export const localPath = (locale: Locale, path: string) =>
  `${locale === "ko" ? "" : "/zh-TW"}${path}`;
export const BRAND = {
  name: "마이까치",
  english: "MY KKACHI",
  handle: "mykkachi",
  taiwanHandle: "mykkachi.tw",
  slogan: "내 이야기를 듣고, 내일을 함께 살피다",
  chinese: "聽你說故事，陪你看明天",
};

// Add the owner's verified public KakaoTalk URL when supplied. Never use a
// guessed account or show a working booking button before it is connected.
export const KAKAO_URL: string = "";

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  alternateName: [BRAND.english, "마이 까치", "MYKKACHI"],
  url: ORIGIN,
  inLanguage: ["ko-KR", "zh-Hant-TW"],
};
