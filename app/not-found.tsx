import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="shell">
        <div className="result-empty" style={{ margin: "50px 0" }}>
          <span className="tiny-label">404 · A DIFFERENT PATH</span>
          <h1>이 페이지는 아직 쓰이지 않았어요.</h1>
          <p>마이까치의 첫 페이지에서 다시 시작해보세요.</p>
          <Link className="primary-button" href="/">
            마이까치로 돌아가기
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
