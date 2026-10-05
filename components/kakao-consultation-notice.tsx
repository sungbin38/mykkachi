import { KAKAO_CHANNEL_URL, type Locale } from "@/lib/brand";

export function KakaoConsultationNotice({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  return <aside className="kakao-consultation-notice">
    <strong>{zh ? "一對一諮詢以 KakaoTalk 文字聊天進行" : "1:1 상담은 카카오톡 채팅으로 진행해요"}</strong>
    <p>{zh ? "【必須】預約一對一諮詢時，請務必加入 MY KKACHI（마이까치）KakaoTalk 頻道，並傳送預約姓名。請在付款時一併完成，方便確認預約並於約定時間開始諮詢。" : "[필수] 1:1 상담을 예약하시면 마이까치 카카오톡 채널을 반드시 추가하고, 채팅으로 예약자 성함을 보내주세요. 입금할 때 함께 완료해 주시면 예약 확인 후 약속한 시간에 상담을 진행해요."}</p>
    <a className="outline-button" href={KAKAO_CHANNEL_URL} target="_blank" rel="noreferrer">{zh ? "加入 MY KKACHI KakaoTalk 頻道" : "마이까치 카카오톡 채널 추가하기"}</a>
  </aside>;
}
