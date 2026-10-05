import { redirect } from "next/navigation";
import { STUDIO_ORIGIN } from "@/lib/brand";
export const metadata = { title: "마이까치 Studio", robots: { index: false, follow: false } };
export default function Page() {
  redirect(`${STUDIO_ORIGIN}/admin`);
}
