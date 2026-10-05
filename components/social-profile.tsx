import Image from "next/image";
import { Download, Plus, Workflow } from "lucide-react";
import { MASCOT_IMAGE } from "@/lib/brand-assets";

export function SocialProfile({
  onCreate,
  onAutomation,
}: {
  onCreate?: () => void;
  onAutomation?: () => void;
}) {
  return (
    <section className="studio-panel social-profile-panel">
      <Image
        className="social-profile-image"
        src={MASCOT_IMAGE}
        alt="크림색 바탕에서 청록색 날개를 흔드는 동글동글한 3D 마이까치 캐릭터"
        width={144}
        height={144}
      />
      <div className="social-profile-copy">
        <span className="tiny-label">THREADS · INSTAGRAM</span>
        <h2>마이까치의 소셜 콘텐츠 준비</h2>
        <p>프로필을 내려받고, Threads 글과 인스타 카드뉴스를 준비하세요.</p>
        <div className="inline-actions">
          <a
            className="outline-button"
            href={MASCOT_IMAGE}
            download="mykkachi-social-profile.png"
          >
            <Download size={15} /> 프로필 사진 PNG
          </a>
          {onCreate && (
            <button className="primary-button" onClick={onCreate}>
              <Plus size={15} /> 콘텐츠 만들기
            </button>
          )}
          {onAutomation && (
            <button className="outline-button" onClick={onAutomation}>
              <Workflow size={15} /> 자동화 설정
            </button>
          )}
        </div>
        <p className="panel-footnote">
          Threads 문구 복사 · 인스타 카드뉴스 PNG 내보내기. 자동 게시는 계정과 게시 기능 연결 후 사용할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
