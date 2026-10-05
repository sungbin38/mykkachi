import { ReadingPage } from "@/components/reading";
export const metadata = {
  title: "免費八字排盤・五行比例",
  description:
    "輸入陽曆生日，免費查看你的日主、八字與五行分布。支援台灣出生，資料不傳送至伺服器。",
  alternates: {
    canonical: "/zh-TW/read",
    languages: { "ko-KR": "/read", "zh-TW": "/zh-TW/read" },
  },
  openGraph: {
    title: "MY KKACHI 免費八字排盤",
    description: "了解你的日主與五行比例",
    locale: "zh_TW",
  },
};
export default function Page() {
  return <ReadingPage locale="zh-TW" />;
}
