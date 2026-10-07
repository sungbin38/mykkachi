import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "DON SSAEM Studio — 콘텐츠 운영",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};
export default async function Page() {
  if (!(await hasAdminSession())) redirect("/admin/login");
  return <AdminDashboard name="운영자" />;
}
