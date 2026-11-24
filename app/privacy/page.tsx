import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY } from "@/lib/legal";
export const metadata: Metadata = { title: "개인정보처리방침", description: "돈쌤이 수집하는 개인정보와 이용 목적, 결제대행사 제공, 보관과 삭제에 관한 안내입니다.", alternates: { canonical: "/privacy", languages: { "ko-KR": "/privacy", "zh-TW": "/zh-TW/privacy" } } };
export default function Page() {
  return <LegalPage title="개인정보처리방침" sections={PRIVACY} />;
}
