import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";

const chineseFont = Noto_Sans_TC({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-noto-tc", display: "swap", preload: false });

export const metadata: Metadata = {
  title: { default: "MY KKACHI", template: "%s | MY KKACHI" },
};

export default function TaiwanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div lang="zh-Hant-TW" className={chineseFont.variable}>{children}</div>;
}
