import { redirect } from "next/navigation";
import { adminPasswordHash, hasAdminSession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "운영 스튜디오 로그인",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (await hasAdminSession()) redirect("/admin");
  return <AdminLogin configured={!!adminPasswordHash()} />;
}
