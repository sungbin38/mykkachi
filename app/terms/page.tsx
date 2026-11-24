import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { TERMS } from "@/lib/legal";
export const metadata: Metadata = { title: "이용약관 · 환불정책", description: "돈쌤 사주 상담·리포트 서비스의 이용약관과 환불정책입니다.", alternates: { canonical: "/terms" } };
export default function Page() {
  return <LegalPage title="이용약관" intro="돈쌤의 사주 상담과 사주 리포트를 이용할 때 적용되는 약관입니다. 환불 기준은 제8조에서 확인할 수 있어요." sections={TERMS} />;
}
