import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site";
import { ReviewsCollection } from "@/components/reviews";

export const metadata: Metadata = {
  title: "당신의 고민, 돈쌤의 답장",
  description: "이직·연애·학업부터 재물과 가족까지",
  alternates: { canonical: "/reviews", languages: { "ko-KR": "/reviews", "zh-TW": "/zh-TW/reviews" } },
  robots: { index: false, follow: false },
  openGraph: { title: "당신의 고민, 돈쌤의 답장", description: "다양한 고민과 돈쌤의 답장을 만나보세요.", url: "/reviews" },
};

export default function ReviewsPage() {
  return <><SiteHeader /><ReviewsCollection /><SiteFooter /></>;
}
