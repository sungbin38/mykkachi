import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY_ZH } from "@/lib/legal";
export const metadata: Metadata = { title: "隱私政策", alternates: { canonical: "/zh-TW/privacy", languages: { "ko-KR": "/privacy", "zh-TW": "/zh-TW/privacy" } } };
export default function Page() {
  return <LegalPage locale="zh-TW" title="隱私政策" sections={PRIVACY_ZH} />;
}
