import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "@/components/journal.css";
import "@/components/reviews.css";
import "@/components/site-design.css";
import { BRAND, ORIGIN } from "@/lib/brand";
import { MASCOT_OG_IMAGE } from "@/lib/brand-assets";
import { Tracking } from "@/components/tracking";
import { PublicMotion } from "@/components/public-motion";

const latinFont = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: "돈쌤 | 사람이 직접 읽는 1:1 사주 상담",
    template: "%s | 돈쌤",
  },
  description:
    "시간이 걸리더라도, 제대로 봐드리겠습니다. 상담자가 직접 읽는 1:1 사주 상담을 예약하고, 상담 뒤 정리한 사주 리포트를 이메일로 받아보세요. 1:1 상담 또는 리포트만 신청할 수 있어요.",
  alternates: {
    canonical: "/",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW", "x-default": "/" },
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: "고민은 천천히, 선택은 나답게. 사람이 직접 읽는 1:1 사주 상담과 약 10페이지 PDF 리포트.",
    type: "website",
    locale: "ko_KR",
    siteName: BRAND.name,
    images: [MASCOT_OG_IMAGE],
  },
  twitter: { card: "summary", images: [MASCOT_OG_IMAGE.url] },
  icons: {
    icon: "/brand/donssaem/icon-v1.png",
    shortcut: "/brand/donssaem/icon-v1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={latinFont.variable}>
      <body className="antialiased">
        {children}
        <Tracking />
        <PublicMotion />
      </body>
    </html>
  );
}
