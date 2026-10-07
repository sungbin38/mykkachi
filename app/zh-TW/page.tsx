import { getArticle } from "@/lib/knowledge";
import { toJournalCard } from "@/lib/journal-card";
import type { Metadata } from "next";
import { HomePage } from "@/components/site";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";
export const metadata: Metadata = {
  title: { absolute: "DON SSAEM｜一對一八字諮詢・專屬八字報告" },
  description:
    "DON SSAEM 陪你慢慢說，找到自己的選擇。由老師親自閱讀命盤與故事，可選擇 KakaoTalk 一對一諮詢，或只申請約 10 頁的 PDF 八字報告。",
  alternates: {
    canonical: "/zh-TW",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW" },
  },
  openGraph: {
    title: "DON SSAEM — 聽你說故事，陪你看明天",
    description: "水豚 Don 老師，陪你梳理眼前的選擇。由人親自解讀的八字諮詢與專屬報告。",
    locale: "zh_TW",
    images: [MASCOT_OG_IMAGE],
  },
};
export default function Page() {
  return <HomePage locale="zh-TW" featuredArticles={["five-elements-balance", "day-branch", "luck-cycles"].map((slug) => toJournalCard(getArticle(slug, "zh-TW")!))} />;
}
