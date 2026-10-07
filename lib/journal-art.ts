import type { Locale } from "./brand";

const art = {
  reading: ["보라색 별빛 아래 책상에서 책을 읽는 카피바라 돈쌤", "紫色星光下，水豚 Don 老師在桌前閱讀攤開的書"],
  conversation: ["별이 빛나는 밤, 나무 아래 다른 카피바라의 이야기를 듣는 돈쌤", "星夜裡，Don 老師在樹下與另一隻水豚談心"],
  journey: ["책을 품에 안고 보라색 별빛 아래 오솔길을 걷는 카피바라 돈쌤", "Don 老師抱著書，走在紫色星空下的小徑上"],
} satisfies Record<string, [string, string]>;

type ArtKey = keyof typeof art;
const artworkBySlug: Record<string, ArtKey> = {
  "four-pillars": "reading", "yin-yang": "reading",
  "ten-heavenly-stems": "journey", "earthly-branches": "journey",
  "ten-gods": "reading", "peers-and-competition": "conversation",
  "expression-and-creativity": "reading", "wealth-stars": "journey",
  "officer-stars": "conversation", "resource-stars": "reading",
  "month-branch": "journey", "day-branch": "conversation", "hour-pillar": "journey",
  "chart-strength": "journey", "useful-elements": "reading", "luck-cycles": "journey",
  "five-elements-balance": "reading", "seasonal-balance": "journey",
  "peach-blossom": "conversation", "benefactors": "reading",
  "harmony-and-clashes": "journey", "career-and-vocation": "reading",
  "relationship-boundaries": "conversation", "daily-renewal": "reading",
  "five-elements": "reading", "birth-time": "reading", "relationship": "conversation",
  "day-master": "journey", "work-rhythm": "reading", "solar-terms": "journey",
};

export function journalArtwork(slug: string, locale: Locale) {
  const key = artworkBySlug[slug] ?? "reading";
  return {
    src: `/brand/donssaem/${key}-v2.webp`,
    alt: art[key][locale === "ko" ? 0 : 1],
    width: 1536,
    height: 1024,
  };
}

export function readingMinutes(body: string, locale: Locale) {
  const length = body.replace(/\s/g, "").length;
  return Math.max(2, Math.ceil(length / (locale === "ko" ? 450 : 350)));
}
