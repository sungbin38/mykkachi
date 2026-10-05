import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { admin, HttpError } from "@/lib/server";
import { AdminDashboard } from "@/components/admin";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "MY KKACHI Studio — 콘텐츠 운영",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};
export default async function Page() {
  await requireChatGPTUser("/admin");
  try {
    const user = await admin();
    return <AdminDashboard name={user.fullName || "운영자"} />;
  } catch (e) {
    if (e instanceof HttpError)
      return (
        <main className="shell">
          <div className="result-empty" style={{ marginTop: 80 }}>
            <h1>관리자 전용 공간입니다.</h1>
            <p>{e.message}</p>
            <a
              className="primary-button"
              href="/signout-with-chatgpt?return_to=/admin"
            >
              다른 계정으로 로그인
            </a>
          </div>
        </main>
      );
    throw e;
  }
}
