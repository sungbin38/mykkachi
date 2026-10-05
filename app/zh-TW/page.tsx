import type { Metadata } from "next";
import { HomePage } from "@/components/site";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";
export const metadata: Metadata = {
  title: "MY KKACHI｜一對一八字諮詢・免費五行解析",
  description:
    "MY KKACHI 聽你說故事，陪你看明天。了解 KakaoTalk 一對一八字諮詢，或先免費探索你的八字與五行，從感情、工作到日常，慢慢認識自己。",
  alternates: {
    canonical: "/zh-TW",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW" },
  },
  openGraph: {
    title: "MY KKACHI — 聽你說故事，陪你看明天",
    description: "一隻小喜鵲，陪在你身旁。一對一八字諮詢介紹與免費五行解讀。",
    locale: "zh_TW",
    images: [MASCOT_OG_IMAGE],
  },
};
export default function Page() {
  return <HomePage locale="zh-TW" />;
}
