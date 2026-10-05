import type { Metadata } from "next";
import "./globals.css";
import { BRAND, ORIGIN } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: "마이까치 | 1:1 카카오톡 사주 상담",
    template: "%s | 마이까치",
  },
  description:
    "내 이야기를 듣고, 내일을 함께 살피다. 마이까치의 1:1 카카오톡 사주 상담 안내와 무료 사주·오행 풀이. 연애와 관계, 일과 진로의 고민을 차분히 살펴보세요.",
  alternates: {
    canonical: "/",
    languages: { "ko-KR": "/", "zh-TW": "/zh-TW", "x-default": "/" },
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: "내 곁의 작은 까치. 1:1 카카오톡 사주 상담 안내와 무료 사주·오행 풀이.",
    type: "website",
    locale: "ko_KR",
    siteName: BRAND.name,
  },
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
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
