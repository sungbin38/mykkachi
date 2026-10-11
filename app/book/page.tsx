import type { Metadata } from "next";
import { BookingPage } from "@/components/booking";
export const metadata: Metadata = {
  title: "상담 예약 · 리포트 신청",
  description: "1:1 사주 상담 또는 리포트만 신청하세요. 약 10페이지 PDF 리포트는 상담자가 직접 분석하고 작성해 약 하루가 걸립니다. 1:1 상담 20만원(마케팅 활용 동의 시 15만원), 리포트만 10월 특가 1만원(동의 시 5천원, 정가 10만원). 계좌이체.",
  alternates: { canonical: "/book", languages: { "ko-KR": "/book", "zh-TW": "/zh-TW/book" } },
};
export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const product = (await searchParams).product === "report" ? "report" : "consultation";
  return <BookingPage key={product} initialProduct={product} />;
}
