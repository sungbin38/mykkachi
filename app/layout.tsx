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
    "나를 알고 싶을 때, 내 사주에 물어봐요. 상담자가 내 상황과 사주를 함께 읽는 최대 1시간 카카오톡 1:1 상담. 상담 후 약 10페이지 PDF 리포트를 이메일로 받아보세요. 리포트만 신청할 수도 있어요.",
  alternates: {
    canonical: "/",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW", "x-default": "/" },
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: "나를 알고 싶을 때, 내 사주에 물어봐요. 최대 1시간 카카오톡 1:1 사주 상담과 약 10페이지 PDF 리포트.",
    type: "website",
    locale: "ko_KR",
    siteName: BRAND.name,
    images: [MASCOT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [MASCOT_OG_IMAGE.url] },
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
