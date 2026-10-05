import { getArticle, articleBody } from "./knowledge";
import { ORIGIN, localPath, type Locale } from "./brand";
import type { CardSlide } from "./cards";
export type Channel = "seo" | "threads" | "instagram";
export type ContentStatus = "draft" | "approved" | "scheduled" | "published";
export type ContentItem = {
  id: string;
  channel: Channel;
  locale: Locale;
  topic: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  keyword: string;
  slides: CardSlide[];
  status: ContentStatus;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export const CHANNEL_NAMES = {
  seo: "SEO 저널",
  threads: "Threads",
  instagram: "Instagram",
};
export function generatePackage(topic: string, locale: Locale): ContentItem[] {
  const a = getArticle(topic, locale);
  if (!a) throw new Error("지원하지 않는 주제입니다.");
  const zh = locale === "zh-TW",
    now = new Date().toISOString();
  const url = (channel: string) =>
    `${ORIGIN}${localPath(locale, "/read")}?utm_source=${channel}&utm_medium=social&utm_campaign=${topic}`;
  const base = {
    locale,
    topic,
    title: a.title,
    slug: topic,
    excerpt: a.excerpt,
    keyword: a.keyword,
    status: "draft" as const,
    scheduledAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const takeaways = a.sections.map(
    (s) => s.text.split(/[。.]\s*/).filter(Boolean)[0],
  );
  const slides: CardSlide[] = [
    {
      title: a.hook,
      body: a.excerpt,
      label: zh ? "MY KKACHI 五行筆記" : "MY KKACHI 사주 노트",
      footer: zh
        ? "收藏這份筆記，慢慢讀懂自己。"
        : "저장해두고, 조금씩 나를 알아가요.",
      index: 0,
    },
    ...a.sections.map((s, i) => ({
      title: s.title,
      body: s.text,
      label: `${String(i + 1).padStart(2, "0")} · ${a.category}`,
      footer: zh
        ? "命理是自我探索的一種觀點。"
        : "사주는 나를 이해하는 하나의 관점입니다.",
      index: i + 1,
    })),
    {
      title: zh
        ? "你的五行，藏著什麼故事？"
        : "내 안에는 어떤 기운이 있을까요?",
      body: zh
        ? "從個人檔案連結，免費查看你的八字與五行。\n追蹤 @mykkachi.tw，聽你說故事，陪你看明天。"
        : "프로필 링크에서 내 사주와 오행을 무료로 확인하세요.\n@mykkachi · 내 이야기를 듣고, 내일을 함께 살피다.",
      label: "A LITTLE BIRD, BY YOUR SIDE",
      footer: zh ? "MY KKACHI · 不需註冊" : "MY KKACHI · 회원가입 없이 무료",
      index: 4,
    },
  ];
  return (["seo", "threads", "instagram"] as Channel[]).map((channel) => ({
    ...base,
    id: crypto.randomUUID(),
    channel,
    slides: channel === "instagram" ? slides : [],
    body:
      channel === "seo"
        ? articleBody(a)
        : channel === "threads"
          ? `${a.hook}\n\n${takeaways.map((t, i) => `${i + 1}. ${t}${zh ? "。" : "."}`).join("\n")}\n\n${zh ? "你最有共鳴的是哪一句？" : "어떤 문장이 가장 와닿나요?"}\n${url("threads")}`
          : `${a.hook}\n\n${a.excerpt}\n\n${zh ? "收藏起來，下次再讀。免費八字在個人檔案連結。" : "저장해두고 천천히 읽어보세요. 무료 사주는 프로필 링크에서."}\n\n${zh ? "#八字 #五行 #自我探索 #MYKKACHI" : "#사주 #오행 #무료사주 #나를알아가는시간 #마이까치"}\n\n${url("instagram")}`,
  }));
}
export function seoChecks(
  item: Pick<ContentItem, "title" | "excerpt" | "body" | "keyword" | "slug">,
) {
  return [
    {
      label: "검색 키워드가 제목에 포함",
      ok:
        item.title.includes(item.keyword) ||
        item.keyword.split(" ").every((w) => item.title.includes(w)),
    },
    {
      label: "고유한 제목 · 10–65자",
      ok: item.title.length >= 10 && item.title.length <= 65,
    },
    {
      label: "설명문 · 35–160자",
      ok: item.excerpt.length >= 35 && item.excerpt.length <= 160,
    },
    { label: "읽을거리 · 350자 이상", ok: item.body.length >= 350 },
    {
      label: "소제목 2개 이상",
      ok: (item.body.match(/^## /gm) || []).length >= 2,
    },
    {
      label: "검색에 읽히는 URL",
      ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug),
    },
  ];
}
