import type { Metadata } from "next";
import { BookingPage } from "@/components/booking";
export const metadata: Metadata = {
  title: "상담 예약",
  description: "원하는 날짜와 시간을 골라 1:1 사주 상담을 예약하세요. 상담자가 직접 읽고, 상담 뒤 사주 리포트를 이메일로 보내드립니다. 상담 20만원(마케팅 동의 시 15만원), 계좌이체. 최대 1시간.",
  alternates: { canonical: "/book" },
};
export default function Page() {
  return <BookingPage />;
}
