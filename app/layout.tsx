import type { Metadata } from "next";
import { DM_Sans, Gowun_Batang } from "next/font/google";
import "./globals.css";
import "@/components/journal.css";
import "@/components/reviews.css";
import "@/components/site-design.css";
import { BRAND, ORIGIN } from "@/lib/brand";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";
import { Tracking } from "@/components/tracking";
import { PublicMotion } from "@/components/public-motion";

const displayFont = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-gowun", display: "swap", preload: false });
const latinFont = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: "마이까치 | 사람이 직접 읽는 1:1 사주 상담",
    template: "%s | 마이까치",
  },
  description:
    "시간이 걸리더라도, 제대로 봐드리겠습니다. AI가 아닌 상담자가 직접 읽는 1:1 사주 상담을 예약하고, 상담 뒤 정리한 사주 리포트를 이메일로 받아보세요. 무료 사주·오행 풀이도 준비되어 있어요.",
  alternates: {
    canonical: "/",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW", "x-default": "/" },
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: "내 곁의 작은 까치. 사람이 직접 읽는 1:1 사주 상담 예약과 무료 사주·오행 풀이.",
    type: "website",
    locale: "ko_KR",
    siteName: BRAND.name,
    images: [MASCOT_OG_IMAGE],
  },
  twitter: { card: "summary", images: [MASCOT_OG_IMAGE.url] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${displayFont.variable} ${latinFont.variable}`}>
      <body className="antialiased">
        {children}
        <Tracking />
        <PublicMotion />
      </body>
    </html>
  );
}
