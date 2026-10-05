import { Journal } from "@/components/journal";
import { articles } from "@/lib/editorial";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "MY KKACHI 專欄 — 五行、八字與日常",
  description: "從五行、日主、出生時間到關係理解，用容易懂的文字認識八字。",
  alternates: {
    canonical: "/zh-TW/journal",
    languages: { "ko-KR": "/journal", "zh-TW": "/zh-TW/journal" },
  },
  openGraph: {
    title: "MY KKACHI 專欄",
    description: "讓八字，走進日常。",
    locale: "zh_TW",
    images: [MASCOT_OG_IMAGE],
  },
};
export default async function Page() {
  return <Journal locale="zh-TW" articles={await articles("zh-TW")} />;
}
