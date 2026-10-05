import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site";
import { ReviewsCollection } from "@/components/reviews";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: "你的煩惱，喜鵲的回信",
  description: "以繁體中文閱讀諮詢對話、依紀錄重述的案例與虛構範例，從十神、大運與流年的作用理解職涯、感情和學業的不同選擇。",
  alternates: {
    canonical: "/zh-TW/reviews",
    languages: { "ko-KR": "/reviews", "zh-TW": "/zh-TW/reviews" },
  },
  robots: { index: false, follow: false },
  openGraph: {
    title: "你的煩惱，喜鵲的回信 | MY KKACHI",
    description: "閱讀感情、財運、職涯與學業的諮詢對話、案例重述與解讀範例。",
    url: "/zh-TW/reviews",
    locale: "zh_TW",
    images: [MASCOT_OG_IMAGE],
  },
};

export default function ReviewsPage() {
  return <><SiteHeader locale="zh-TW" /><ReviewsCollection locale="zh-TW" /><SiteFooter locale="zh-TW" /></>;
}
