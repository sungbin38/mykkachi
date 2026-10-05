import { ReadingPage } from "@/components/reading";
export const metadata = {
  title: "무료 사주·오행 계산",
  description:
    "생년월일로 일간과 사주 오행 분포를 무료로 확인하세요. 출생 정보는 브라우저에서만 처리합니다.",
  alternates: {
    canonical: "/read",
    languages: { "ko-KR": "/read", "zh-TW": "/zh-TW/read" },
  },
};
export default function Page() {
  return <ReadingPage locale="ko" />;
}
