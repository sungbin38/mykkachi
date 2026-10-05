import type { Locale } from "./brand";

const art = {
  foundations: ["책을 펼친 까치와 다섯 가지 자연의 풍경", "喜鵲與攤開的書，遠方是五行意象的山水"],
  seasons: ["사계절의 빛이 흐르는 산과 나뭇가지 위의 까치", "枝頭上的喜鵲，遠方山谷流轉著四季的色彩"],
  growth: ["서로 다른 모습으로 자라는 소나무와 덩굴, 작은 까치", "松樹與藤蔓各自生長，小喜鵲停在枝頭"],
  companions: ["서로의 자리를 지키며 마주 보는 두 마리 까치", "兩隻喜鵲在相鄰枝頭相望，保有彼此的空間"],
  expression: ["꽃과 나뭇가지로 둥지를 짓는 까치", "喜鵲以細枝和小花編織巢，象徵創作與練習"],
  harvest: ["잘 익은 감을 담은 바구니 곁의 까치", "喜鵲停在盛著熟柿的竹籃旁，象徵累積與收穫"],
  boundaries: ["돌담 사이 열린 나무 대문에 앉은 까치", "喜鵲停在敞開的木門上，石牆旁延伸著小徑"],
  study: ["책과 찻잔이 놓인 창가의 까치", "喜鵲陪伴窗邊的書本與茶杯，遠方是晨光山景"],
  balance: ["잔잔한 물과 둥근 돌 위 나뭇가지의 까치", "喜鵲停在溪水與圓石上方，水面映著柔和日光"],
  journey: ["징검다리와 새벽 산길 위를 날아가는 까치", "喜鵲飛過溪流上的踏腳石，迎向山間晨光"],
  blossom: ["복사꽃이 핀 가지 위에 내려앉은 까치", "喜鵲停在粉色桃花枝頭，花瓣輕輕飄落"],
  rest: ["달빛 아래 편지와 찻잔이 있는 창가의 까치", "月光下的喜鵲，窗邊放著繫有緞帶的信與茶杯"],
} satisfies Record<string, [string, string]>;

type ArtKey = keyof typeof art;
const artworkBySlug: Record<string, ArtKey> = {
  "four-pillars": "foundations", "yin-yang": "balance",
  "ten-heavenly-stems": "growth", "earthly-branches": "seasons",
  "ten-gods": "foundations", "peers-and-competition": "companions",
  "expression-and-creativity": "expression", "wealth-stars": "harvest",
  "officer-stars": "boundaries", "resource-stars": "study",
  "month-branch": "seasons", "day-branch": "companions", "hour-pillar": "harvest",
  "chart-strength": "growth", "useful-elements": "balance", "luck-cycles": "journey",
  "five-elements-balance": "balance", "seasonal-balance": "seasons",
  "peach-blossom": "blossom", "benefactors": "study",
  "harmony-and-clashes": "journey", "career-and-vocation": "expression",
  "relationship-boundaries": "boundaries", "daily-renewal": "rest",
  "five-elements": "foundations", "birth-time": "rest", "relationship": "companions",
  "day-master": "growth", "work-rhythm": "expression", "solar-terms": "seasons",
};

export function journalArtwork(slug: string, locale: Locale) {
  const key = artworkBySlug[slug] ?? "foundations";
  return {
    src: `/images/journal/${key}-v1.webp`,
    alt: art[key][locale === "ko" ? 0 : 1],
    width: 1536,
    height: 1024,
  };
}

export function readingMinutes(body: string, locale: Locale) {
  const length = body.replace(/\s/g, "").length;
  return Math.max(2, Math.ceil(length / (locale === "ko" ? 450 : 350)));
}
