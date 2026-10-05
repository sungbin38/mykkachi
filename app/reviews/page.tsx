import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site";
import { ReviewsCollection } from "@/components/reviews";

export const metadata: Metadata = {
  title: "당신의 고민, 까치의 답장",
  description: "이직과 커리어, 연애와 결혼, 건강과 자녀, 학업까지. 실제 대화와 창작 예시 상담을 카카오톡 형태로 읽어보세요.",
  alternates: { canonical: "/reviews", languages: { "ko-KR": "/reviews" } },
  robots: { index: false, follow: false },
  openGraph: { title: "당신의 고민, 까치의 답장", description: "다양한 고민과 까치 선생님의 답장. 실제 상담 대화와 창작 예시를 만나보세요.", url: "/reviews" },
};

export default function ReviewsPage() {
  return <><SiteHeader /><ReviewsCollection /><SiteFooter /></>;
}
