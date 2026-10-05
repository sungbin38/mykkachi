import type { Metadata } from "next";
import { BookingPage } from "@/components/booking";
export const metadata: Metadata = {
  title: "預約諮詢・申請八字報告",
  description: "預約一對一八字諮詢或申請約 10 頁 PDF 報告。時段以台灣標準時間顯示，韓元計價，Hana Bank 轉帳。",
  alternates: { canonical: "/zh-TW/book", languages: { "ko-KR": "/book", "zh-TW": "/zh-TW/book" } },
};
export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const product = (await searchParams).product === "report" ? "report" : "consultation";
  return <BookingPage key={product} initialProduct={product} locale="zh-TW" />;
}
