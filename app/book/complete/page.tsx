import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PaymentComplete } from "@/components/payment-complete";
export const metadata: Metadata = { title: "결제 확인", robots: { index: false, follow: false } };
// PortOne returns mobile payments here with ?paymentId=… and, on failure, ?code=…&message=….
export default async function Page({ searchParams }: { searchParams: Promise<{ paymentId?: string; code?: string; message?: string }> }) {
  const { paymentId, code, message } = await searchParams;
  if (!paymentId) redirect("/book");
  return <PaymentComplete paymentId={paymentId} failed={code !== undefined} message={message} />;
}
