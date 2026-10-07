import { getArticle } from "@/lib/knowledge";
import { toJournalCard } from "@/lib/journal-card";
import type { Metadata } from "next";
import { HomePage } from "@/components/site";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";
export const metadata: Metadata = {
  title: { absolute: "DON SSAEM｜一對一八字諮詢・專屬八字報告" },
  description:
    "想更了解自己時，問問自己的八字。與 DON SSAEM 一起認識性格、關係、工作與人生的節奏。KakaoTalk 一對一諮詢最長 1 小時，包含約 10 頁的 PDF 報告，也可單獨申請報告。",
  alternates: {
    canonical: "/zh-TW",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW" },
  },
  openGraph: {
    title: "DON SSAEM — 想更了解自己時，問問自己的八字。",
    description: "從性格、關係與工作，到人生的節奏，與老師一起從八字認識自己。最長 1 小時的一對一諮詢，與一份能回頭閱讀的專屬 PDF 報告。",
    locale: "zh_TW",
    images: [MASCOT_OG_IMAGE],
  },
};
export default function Page() {
  return <HomePage locale="zh-TW" featuredArticles={["five-elements-balance", "day-branch", "luck-cycles"].map((slug) => toJournalCard(getArticle(slug, "zh-TW")!))} />;
}
