import { Journal } from "@/components/journal";
import { articles } from "@/lib/editorial";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "마이까치 저널 — 사주를 일상의 언어로",
  description:
    "오행·일간·출생시간·궁합을 쉽게 읽는 사주 가이드. 나를 이해하는 마이까치의 이야기.",
  alternates: {
    canonical: "/journal",
    languages: { "ko-KR": "/journal", "zh-TW": "/zh-TW/journal" },
  },
};
export default async function Page() {
  return <Journal locale="ko" articles={await articles("ko")} />;
}
