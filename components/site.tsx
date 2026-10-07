"use client";
import { KakaoConsultationNotice } from "./kakao-consultation-notice";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Leaf, Heart, Compass, Moon, Globe2, LockKeyhole, BookOpen, Menu, ArrowRight, ChevronDown, UserRound, Clock3, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { BRAND, FREE_READING_ENABLED, KAKAO_URL, homePath, localPath, websiteSchema, type Locale } from "@/lib/brand";
import { BrandMascot } from "./brand-mascot";
import { FeaturedReviews } from "./reviews";
import { BirthFields } from "./birth-fields";
import { JournalCard } from "./journal-card";
import type { JournalCardData } from "@/lib/journal-card";
import reportArtwork from "@/public/brand/donssaem/reading-v2.webp";
import heroArtwork from "@/public/brand/donssaem/mascot-v1.webp";

export function Logo() {
  return <span className="wordmark"><BrandMascot portrait size={48} className="wordmark-mascot" /><span className="wordmark-type"><strong>{BRAND.name}</strong>{" "}<span>{BRAND.english}</span></span></span>;
}
export function SiteHeader({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  const pathname = usePathname();
  const otherLocale = zh ? "ko" : "zh-TW";
  const languageHref = (pathname === localPath(locale, "/book") || pathname === localPath(locale, "/reviews") || pathname === localPath(locale, "/journal") || pathname.startsWith(localPath(locale, "/journal/")))
    ? localPath(otherLocale, zh ? pathname.slice(6) : pathname)
    : homePath(otherLocale);
  const nav = [
    [homePath(locale) + "#story", zh ? "從八字認識自己" : "사주로 보는 나"],
    [homePath(locale) + "#consultation", zh ? "諮詢方式" : "상담 안내"],
        [localPath(locale, "/reviews"), zh ? "諮詢故事" : "상담 이야기"],
    ...(FREE_READING_ENABLED ? [[localPath(locale, "/read"), zh ? "免費八字" : "무료 사주"]] : []),
    [localPath(locale, "/journal"), zh ? "日常專欄" : "돈쌤의 사주 노트"],
  ];
  return <header className="site-header"><a className="skip-link" href="#main-content">{zh ? "跳至主要內容" : "본문으로 바로가기"}</a><div className="shell header-inner">
    <a href={homePath(locale)} aria-label={zh ? "돈쌤 DON SSAEM 首頁" : "돈쌤 DON SSAEM 홈"}><Logo /></a>
    <nav className="site-nav" aria-label={zh ? "主要導覽" : "주 메뉴"}>{nav.map(([href, label]) => <a key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</a>)}</nav>
    <div className="header-tools">
      <a className="language" href={languageHref} aria-label={zh ? "한국어, 切換至韓文" : "繁體中文, 대만 번체 중국어로 변경"}><Globe2 size={16} />{zh ? "한국어" : "繁體中文"}</a>
      <a className="outline-button" href={localPath(locale, "/book")}>{zh ? "一對一諮詢" : "상담 예약"}<ArrowUpRight size={15} /></a>
      <Sheet><SheetTrigger className="mobile-menu" aria-label={zh ? "開啟選單" : "메뉴 열기"}><Menu size={21} /></SheetTrigger>
        <SheetContent><SheetTitle className="px-6 pt-8">{BRAND.english}</SheetTitle><SheetDescription className="px-6">{zh ? BRAND.chinese : BRAND.slogan}</SheetDescription><nav className="mobile-nav">{nav.map(([href,label]) => <SheetClose asChild key={href}><a href={href} aria-current={pathname === href ? "page" : undefined}>{label}</a></SheetClose>)}</nav></SheetContent>
      </Sheet>
    </div>
  </div></header>;
}
export function SiteFooter({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  const [policy, setPolicy] = useState("");
  const privacy = zh
    ? "免費排盤所用的生日、出生時間與暱稱僅在瀏覽器中處理，不儲存在伺服器。網站僅累計匿名事件次數，不記錄生日、IP 或使用者識別碼。預約諮詢時填寫的姓名、電子郵件、聯絡方式、出生資料與故事，用於預約確認、諮詢與寄送報告，並儲存在伺服器；依預約時的同意，也會以電子郵件與電話寄送 DON SSAEM 的消息與活動通知，可隨時回覆取消；諮詢後可要求刪除。管理後台需密碼登入，內容草稿儲存在伺服器。"
    : "무료 사주에 입력한 생년월일·출생시간·닉네임은 브라우저에서 계산하며 서버에 저장하지 않습니다. 페이지별 익명 이벤트 횟수만 집계하며 생년월일·IP·사용자 식별자를 저장하지 않습니다. 상담 예약·리포트 신청 시 입력한 이름·이메일·연락처·출생 정보·사연은 신청 확인과 상담, 리포트 작성·발송에 사용하며 서버에 저장됩니다. 예약 시 동의에 따라 남긴 이메일과 연락처로 돈쌤의 소식·이벤트 안내를 보내드리며, 답장으로 언제든 수신을 거절할 수 있습니다. 상담 뒤 삭제를 요청하시면 지워드립니다. 관리자 콘텐츠 초안도 서버에 저장됩니다.";
  const terms = zh
    ? "免費八字排盤採陽曆、節氣換年月、午夜換日，不做真太陽時校正。解讀以文化體驗與自我探索為目的。一對一諮詢由老師透過 KakaoTalk 文字聊天進行，諮詢前請務必加入 KakaoTalk 諮詢頻道。每次最長一小時，談完可能提前結束。費用為 20 萬韓元，同意行銷用途則為 15 萬韓元；進行方式與取消退款規則將於預約確認信中說明，確認後再以銀行轉帳付款。諮詢包含報告；只購買報告為 10 萬韓元，同意匿名行銷用途為 5 萬韓元。報告約 10 頁，由老師親自分析與撰寫，約需一天，再以 PDF 寄到電子信箱。單獨報告於確認付款後開始製作。網站不提供自動扣款。"
    : "무료 사주는 양력·절입 기준 연월주와 자정 기준 일주를 사용하며 진태양시 보정을 적용하지 않습니다. 해석은 문화적 경험과 자기 이해를 위한 참고입니다. 1:1 상담은 카카오톡 채팅으로 상담자가 직접 진행하며, 상담 전 카카오톡 상담 채널을 반드시 추가해야 합니다. 회당 최대 1시간이고 이야기가 정리되면 더 일찍 끝날 수 있습니다. 비용은 20만원, 상담 이야기의 익명 후기·콘텐츠 활용에 동의하면 15만원이며, 진행 방법·취소 및 환불 기준은 예약 확인 메일로 안내받고 확인한 뒤 계좌이체로 결제하는 방식입니다. 상담 후 리포트가 포함됩니다. 상담 없이 리포트만 받는 상품은 10만원, 사연과 풀이의 익명 마케팅 활용에 동의하면 5만원입니다. 리포트는 약 10페이지 분량의 PDF로 이메일 발송합니다. 상담자가 직접 분석하고 작성해 약 하루가 걸리며, 리포트 단독 상품은 입금 확인 후 제작을 시작합니다. 사이트 내 자동 결제는 제공하지 않습니다.";
  return <><footer className="site-footer"><div className="shell">
    <div className="footer-top"><a href={homePath(locale)} aria-label={zh ? "돈쌤 DON SSAEM 首頁" : "돈쌤 DON SSAEM 홈"}><Logo /></a>
      <div className="footer-links"><a href={localPath(locale, "/journal")}>{zh ? "日常專欄" : "돈쌤의 사주 노트"}</a><a href={homePath(locale)+"#story"}>{zh ? "從八字認識自己" : "사주로 보는 나"}</a><a href={localPath(locale, "/book")}>{zh ? "預約一對一諮詢" : "상담 예약"}</a><a href={localPath(locale, "/reviews")}>{zh ? "諮詢故事" : "상담 이야기"}</a><button onClick={() => setPolicy("privacy")}>{zh ? "隱私說明" : "개인정보 안내"}</button><button onClick={() => setPolicy("terms")}>{zh ? "使用說明" : "이용 안내"}</button></div>
    </div><p className="site-contact">{zh ? "預約或付款遇到問題，請透過 KakaoTalk 聯絡我們。" : "예약·입금에 문제가 있으면 카카오톡으로 문의해 주세요."}<a href={KAKAO_URL} target="_blank" rel="noreferrer">{zh ? "KakaoTalk 客服" : "카카오톡 문의"}</a></p><div className="footer-bottom"><span>© {new Date().getFullYear()} DON SSAEM. Take your time. Find your way.</span></div>
  </div></footer><Dialog open={!!policy} onOpenChange={() => setPolicy("")}><DialogContent><DialogTitle>{policy === "privacy" ? (zh ? "隱私說明" : "개인정보 안내") : (zh ? "使用說明" : "이용 안내")}</DialogTitle><DialogDescription className="dialog-copy">{policy === "privacy" ? privacy : terms}</DialogDescription></DialogContent></Dialog></>;
}
export function HomePage({ locale, featuredArticles }: { locale: Locale; featuredArticles: JournalCardData[] }) {
  const zh = locale === "zh-TW";
  const [birth, setBirth] = useState("");
  const cards = zh ? [
    ["我的五行", "認識與生俱來的性格與節奏", "基礎命盤"], ["關係的溫度", "理解彼此不同的表達方式", "感情與關係"], ["工作的方向", "探索適合自己的做事方式", "事業與自我"], ["給自己的提問", "從五行開始今天的練習", "日常練習"],
  ] : [
    ["나를 이루는 다섯 가지", "타고난 기질과 나만의 속도를 읽어요", "나의 오행"], ["우리 사이의 온도", "서로 다른 마음의 언어를 이해해요", "연애와 관계"], ["나답게 일하는 방법", "내게 맞는 일의 방식을 찾아요", "일과 가능성"], ["오늘, 나에게 건네는 말", "내 기질을 돌보는 작은 실천을 만나요", "일상의 힌트"],
  ];
  const Icons = [Leaf, Heart, Compass, Moon];
  const promises = zh ? [
    ["先聽你說", "不必把煩惱整理得很完整。從你現在最在意的事，慢慢開始。"], ["用聽得懂的話說明", "把八字的象徵，連結到你的經歷與日常，讓對話容易理解。"], ["把選擇留給你", "一起梳理值得思考的方向，讓你帶著自己的步調走向明天。"],
  ] : [
    ["먼저, 충분히 들어요", "고민을 잘 정리해 오지 않아도 괜찮아요. 지금 가장 마음에 걸리는 이야기부터 시작해요."], ["알아들을 수 있게 풀어요", "낯선 명리 용어를 일상의 말로 바꾸고, 당신이 겪고 있는 상황과 함께 살펴요."], ["선택은 당신에게 남겨요", "상담 끝에는 더 생각해 볼 질문과 방향을 정리해요. 다음 걸음은 당신의 속도로 내디뎌요."],
  ];
  const ours = zh ? [
    ["由人親自排盤、親自讀", "老師會先核對你的年月日時四柱，再從你的生活脈絡解讀，每一份都親自分析。"], ["把你的故事放進命盤裡", "預約時留下的煩惱，會在對話前先讀過。八字只是線索，重點是你此刻的處境。"], ["留下一份能回頭看的報告", "諮詢後約一天，把談到的內容整理成報告寄到你的信箱，之後隨時可以再讀。"],
  ] : [
    ["사람이 직접 명식을 세우고 읽어요", "상담자가 연·월·일·시 네 기둥을 먼저 확인하고, 당신의 상황에 맞춰 풀어요. 한 분 한 분 직접 분석해요."], ["당신의 사연을 명식 안에 놓고 봐요", "예약할 때 남긴 고민을 상담 전에 미리 읽어요. 사주는 실마리이고, 중심은 지금 당신이 겪는 일이에요."], ["다시 꺼내 읽을 수 있는 리포트를 남겨요", "상담이 끝나면 나눈 이야기를 정리해 약 하루 뒤 이메일로 보내드려요. 시간이 지나 다시 읽어도 괜찮도록요."],
  ];
  const steps = zh ? [
    ["選擇日期與時間", "以一小時為單位，挑選你方便的時段。諮詢最長一小時，可能提前結束。"], ["留下基本資料", "出生年月日與時間、性別、聯絡方式。請務必寫下你的故事，寫得越具體，解讀就越深入。"], ["立即轉帳後確認", "預約後請立即將諮詢費用（20 萬韓元，同意匿名分享心得則 15 萬韓元）轉入指定帳戶，30 分鐘內未轉帳將自動取消。老師確認後寄出確定通知。請務必加入 KakaoTalk 諮詢頻道並傳送預約姓名。到約定時間，以 KakaoTalk 一對一文字聊天進行，最長一小時。"], ["收到八字報告", "諮詢結束後，老師親自分析與撰寫約 10 頁的 PDF 報告，約需一天，再寄到你的信箱。"],
  ] : [
    ["날짜와 시간 고르기", "1시간 단위로 열린 시간 중에서 편한 때를 골라요. 상담은 최대 1시간이고, 더 일찍 끝날 수도 있어요."], ["나에 대해 알려주기", "생년월일과 태어난 시간, 성별, 연락처를 남겨요. 사연은 꼭 적어주세요. 상황과 궁금한 점을 자세히 적을수록 더 깊이 읽을 수 있어요."], ["바로 입금하고 확정", "상담 비용 20만원(후기 활용 동의 시 15만원)을 예약 직후 안내한 계좌로 입금해요. 30분 안에 입금이 없으면 자동 취소돼요. 상담자가 확인하고 확정 메일을 보내요. 카카오톡 상담 채널을 반드시 추가하고 예약자 성함을 보내주세요. 약속한 시간에 카카오톡 1:1 채팅으로 최대 1시간 이야기를 나눠요."], ["사주 리포트 받기", "상담 후 직접 분석하고 작성한 약 10페이지 PDF 리포트를 이메일로 보내드려요. 작성에는 약 하루가 걸립니다."],
  ];
  const reportParts = zh ? [
    ["日柱", "你的名牌：與生俱來的性格與傾向"], ["格局", "你天生的「武器」與使用方式"], ["大運流向", "每十年的環境變化，以及該留意的事"], ["要小心的事", "關係、健康、金錢上需要注意的訊號"], ["開運方法", "數字、運動、植物、食物：日常的小習慣"], ["方向與顏色", "搬家、旅行、工作可參考的方位與衣著"], ["與你合得來的人", "容易相處的日柱"], ["提醒", "寫給你的最後一段話"],
  ] : [
    ["일주", "나의 이름표. 타고난 성격과 성향"], ["격국", "타고난 나의 무기와 쓰는 법"], ["대운 흐름", "10년 단위로 바뀌는 환경과 그때 살필 것"], ["조심할 것", "관계·건강·돈에서 눈여겨볼 신호"], ["개운법", "숫자, 운동, 식물, 음식. 일상의 작은 습관"], ["방향과 색", "이사·여행·일에 참고할 방위와 옷 색"], ["나와 맞는 사람", "편하게 어울리는 일주"], ["유의점", "당신에게 남기는 마지막 한마디"],
  ];
  return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="brand-home">
    <section className="hero-stage"><div className="shell hero">
      <div className="hero-copy">
        <p className="eyebrow">{zh ? "DON SSAEM · 由人親自解讀的八字" : "돈쌤 · 사람이 직접 읽는 사주"}</p>
        <h1>{zh ? <>想更了解自己時，<br /><em>問問自己的八字。</em></> : <>나를 알고 싶을 때,<br /><em>내 사주에 물어봐요.</em></>}</h1>
        <p className="hero-description">{zh ? <>從天生的性格，到關係、工作與人生的節奏。<br />老師親自讀你的故事，也讀你的八字。</> : <>타고난 성향부터 관계와 일, 앞으로의 흐름까지.<br />당신의 이야기와 사주를 함께 읽어요.</>}</p>
        <div className="hero-actions"><a className="primary-button" href={localPath(locale, "/book")}>{zh ? "預約一對一諮詢" : "1:1 상담 예약하기"}<ArrowUpRight size={18} /></a><a className="text-link" href="#report">{zh ? "先了解八字報告" : "사주 리포트 알아보기"}<ArrowRight size={16} /></a></div>
      </div>
      <figure className="hero-art donssaem-hero">
        <Image src={heroArtwork} alt={zh ? "抱著書、穿青綠韓服的水豚 Don 老師" : "청록색 옷을 입고 책을 든 카피바라 돈쌤"} sizes="(max-width: 767px) 100vw, 550px" loading="eager" fetchPriority="high" />
        <figcaption>{zh ? "從你現在最在意的問題開始。" : "지금 가장 궁금한 것부터 이야기해요."}</figcaption>
      </figure>
    </div></section>
    <div className="shell"><dl className="consultation-facts">
      <div><UserRound size={22} aria-hidden="true" /><dt>{zh ? "最長 1 小時" : "최대 1시간"}</dt><dd>{zh ? "KakaoTalk 一對一文字諮詢" : "카카오톡으로 나누는 1:1 채팅 상담"}</dd></div>
      <div><BookOpen size={22} aria-hidden="true" /><dt>{zh ? "約 10 頁 PDF" : "약 10페이지 PDF"}</dt><dd>{zh ? "諮詢包含老師親自撰寫的報告" : "상담 후 직접 작성한 사주 리포트 포함"}</dd></div>
      <div><Clock3 size={22} aria-hidden="true" /><dt>{zh ? "約 1 天後寄送" : "약 하루 뒤 발송"}</dt><dd>{zh ? "諮詢後完成報告，以電子郵件寄送" : "상담 내용을 정리해 이메일로 전달"}</dd></div>
    </dl></div>
    <section id="story" className="shell story-section" data-reveal aria-labelledby="story-title">
      <div className="story-heading"><p className="section-kicker">{zh ? "給自己一段認識自己的時間" : "나를 알아가는 시간"}</p><h2 id="story-title">{zh ? <>從現在的自己，<br />看向未來的生活。</> : <>지금의 나부터,<br />앞으로의 나까지.</>}</h2>
        <ul className="story-questions"><li>{zh ? "「我是一個什麼樣的人？」" : "“나는 어떤 성향을 가진 사람일까요?”"}</li><li>{zh ? "「什麼樣的關係與工作適合我？」" : "“나에게 잘 맞는 관계와 일은 무엇일까요?”"}</li><li>{zh ? "「接下來的人生會有哪些變化？」" : "“앞으로 어떤 흐름을 맞이하게 될까요?”"}</li></ul>
      </div>
      <div className="story-copy">
        <p>{zh ? "想更了解自己、梳理生活中的疑問，或看看接下來的人生節奏。不一定要有明確的煩惱，從最近的生活和對自己的好奇開始就好。" : "나를 더 잘 이해하고 싶을 때, 일상의 궁금함을 풀고 싶을 때, 앞으로의 흐름을 살펴보고 싶을 때. 뚜렷한 고민이 없어도 괜찮아요. 요즘의 이야기와 나에 대해 궁금한 점부터 나눠주세요."}</p>
        <p>{zh ? "老師會先讀過你的故事，把八字中的性格、優勢與不同時期的變化，放回你的生活裡解讀。透過一對一對話，一起理解自己在人際關係與工作中的樣子，整理往後值得留意的事。" : "상담자가 이야기를 먼저 읽고, 사주에 나타난 성향과 강점, 시기별 흐름을 지금의 삶에 비춰 풀어요. 1:1 대화로 관계와 일에서 드러나는 나의 모습을 살피고, 앞으로 참고할 점을 함께 정리해요."}</p>
        <p className="story-emphasis">{zh ? "談完後，重點會整理成約 10 頁 PDF，約一天後寄到信箱。之後想再了解自己時，也能隨時翻閱。" : "상담이 끝나면 풀이와 나눈 이야기를 약 10페이지 PDF로 정리해, 약 하루 뒤 이메일로 보내드려요. 시간이 지나도 나를 이해하는 참고로 꺼내 읽을 수 있도록요."}</p>
      </div>
    </section>
    <section className="brand-promise" aria-label={zh ? "我們的承諾" : "돈쌤의 약속"}><div className="shell"><p>{zh ? <>就算多花些時間，<br />也會好好為你看。</> : <>시간이 걸리더라도,<br />제대로 봐드리겠습니다.</>}</p><span>{zh ? "你的故事，值得被認真對待。" : "한 사람의 이야기는, 그만큼의 정성이 필요하니까요."}</span></div></section>
    <section id="why" className="approach-section" aria-labelledby="why-title"><div className="shell">
      <div className="approach-layout">
        <div className="approach-heading"><p className="tiny-label">{zh ? "我們的諮詢方式" : "돈쌤의 상담"}</p><h2 id="why-title">{zh ? <>八字之外，<br />先聽你的故事。</> : <>사주보다 먼저,<br />당신의 이야기를 들어요.</>}</h2><p>{zh ? "八字是線索，重點是你此刻的生活。一個人，為另一個人，慢慢讀。" : "사주는 실마리이고, 중심은 지금 당신이 겪는 일이에요. 한 사람이 한 사람을 위해 천천히 읽습니다."}</p><a className="text-link" href="#consultation">{zh ? "了解諮詢方式" : "상담 안내 살펴보기"}<ArrowRight size={16} /></a></div>
        <div className="approach-list" data-reveal>{ours.map(([title, body], i) => { const Icon = [UserRound, BookOpen, Mail][i]; return <article key={title}><Icon size={24} strokeWidth={1.5} aria-hidden="true" /><div><h3>{title}</h3><p>{body}</p></div></article>; })}</div>
      </div>
      <details className="comparison-details"><summary>{zh ? "可以帶著什麼樣的煩惱來？" : "어떤 고민을 가져가도 괜찮을까요?"}<ChevronDown size={18} aria-hidden="true" /></summary><div className="care-promises">{promises.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></details>
    </div></section>
    <section id="consultation" className="consultation-section" aria-labelledby="consultation-title"><div className="shell">
      <div className="consultation-heading" data-reveal><h2 id="consultation-title">{zh ? <>透過對話，或文字。<br />選擇適合自己的方式。</> : <>대화로, 또는 글로.<br />나에게 맞는 사주 풀이.</>}</h2><p>{zh ? "想聊聊可以選一對一諮詢，想按自己的步調閱讀可以只購買報告。兩種方式都由老師親自閱讀命盤與故事。" : "직접 이야기 나누고 싶다면 1:1 상담을, 내 속도로 읽고 싶다면 리포트를 골라주세요. 두 상품 모두 상담자가 사연과 명식을 직접 읽고 풀이해요."}</p></div>
      <div className="consultation-offers" data-reveal>
        <article className="service-offer service-conversation">
          <div className="service-title"><UserRound size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{zh ? "一對一八字諮詢" : "1:1 사주 상담"}</h3></div>
          <p className="service-description">{zh ? "把心裡的問題慢慢說出來，一起看看眼前的選擇。" : "마음에 걸리는 질문을 나누며, 지금의 선택을 함께 살펴요."}</p>
          <p className="service-price-condition">{zh ? "同意匿名行銷使用時" : "마케팅 활용 동의 시"}</p>
          <div className="service-price"><strong>{zh ? "15 萬" : "15만원"}</strong><span className="service-saving">{zh ? "省 5 萬韓元" : "5만원 할인"}</span></div>
          <p className="service-base-price">{zh ? "基本費用 20 萬韓元・最長一小時" : "기본가 20만원 · 최대 1시간"}</p>
          <p className="service-discount">{zh ? "同意將故事與解讀隱去姓名及個資後，用於行銷心得與內容，即可享有折扣。" : "이름·개인정보를 가린 사연과 풀이를 마케팅 후기·콘텐츠로 활용하는 데 동의하면 적용돼요."}</p>
          <ul className="service-includes"><li>{zh ? "由老師透過 KakaoTalk 一對一文字諮詢" : "카카오톡 채팅으로 나누는 1:1 상담"}</li><li>{zh ? "針對你的故事與問題解讀" : "내 사연과 질문에 맞춘 사주 풀이"}</li><li>{zh ? "包含約 10 頁的 PDF 報告" : "상담 후 약 10페이지 PDF 리포트 포함"}</li></ul>
          <KakaoConsultationNotice locale={locale} />
          <a className="primary-button" href={`${localPath(locale, "/book")}?product=consultation`}>{zh ? "預約一對一諮詢" : "1:1 상담 예약하기"}<ArrowUpRight size={18} /></a>
        </article>
        <article className="service-offer service-report">
          <div className="service-title"><Mail size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{zh ? "只購買八字報告" : "사주 리포트만 받기"}</h3></div>
          <p className="service-description">{zh ? "不需要約定時間，在適合自己的時刻慢慢閱讀。" : "시간을 맞추지 않아도 괜찮아요. 편할 때 천천히 읽어보세요."}</p>
          <p className="service-price-condition">{zh ? "同意匿名行銷使用時" : "마케팅 활용 동의 시"}</p>
          <div className="service-price"><strong>{zh ? "5 萬" : "5만원"}</strong><span className="service-saving">{zh ? "省 5 萬韓元" : "5만원 할인"}</span></div>
          <p className="service-base-price">{zh ? "基本費用 10 萬韓元・PDF 電子郵件寄送" : "기본가 10만원 · PDF 이메일 발송"}</p>
          <p className="service-discount">{zh ? "同意將故事與解讀隱去姓名及個資後，用於行銷心得與內容，即可享有折扣。" : "이름·개인정보를 가린 사연과 풀이를 마케팅 후기·콘텐츠로 활용하는 데 동의하면 적용돼요."}</p>
          <ul className="service-includes"><li>{zh ? "不需預約諮詢時間" : "상담 시간 선택 없이 신청"}</li><li>{zh ? "由老師親自分析與撰寫，約需一天" : "사람이 직접 분석·작성, 약 하루 소요"}</li><li>{zh ? "約 10 頁的 PDF 報告寄到你的信箱" : "약 10페이지 PDF 리포트 이메일 수령"}</li></ul>
          <a className="outline-button" href={`${localPath(locale, "/book")}?product=report`}>{zh ? "只申請八字報告" : "리포트만 신청하기"}<ArrowUpRight size={18} /></a>
        </article>
      </div>
      <p className="service-footnote">{zh ? "單獨報告不含一對一對話。確認付款後由老師親自分析與撰寫，約需一天，再以電子郵件寄送。預約時段以台灣標準時間（UTC+8）顯示，費用以韓元計價，轉帳至 Hana Bank（韓國韓亞銀行）帳戶。" : "리포트 단독 상품에는 1:1 상담이 포함되지 않아요. 입금 확인 후 상담자가 직접 분석하고 작성하며, 약 하루 뒤 이메일로 보내드려요."}</p>
      <p className="site-contact">{zh ? "諮詢、報告或付款遇到問題，請透過 KakaoTalk 聯絡我們。" : "상담·리포트 신청이나 입금에 문제가 있으면 카카오톡으로 문의해 주세요."}<a href={KAKAO_URL} target="_blank" rel="noreferrer">{zh ? "KakaoTalk 客服" : "카카오톡 문의"}</a></p><details className="consultation-process"><summary>{zh ? "一對一諮詢如何進行？" : "1:1 상담은 어떻게 진행되나요?"}<ChevronDown size={18} aria-hidden="true" /></summary><ol className="consultation-timeline">{steps.map(([title, body], i) => <li key={title}><span className="timeline-number" aria-hidden="true">{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></details>
    </div></section>
    <FeaturedReviews locale={locale} />
    <section id="report" className="shell report-section" data-reveal aria-labelledby="report-title">
      <div className="report-intro"><h2 id="report-title">{zh ? <>按自己的步調，<br />隨時回頭再讀的八字報告。</> : <>내 속도로,<br />다시 꺼내 읽는 사주 리포트.</>}</h2><p>{zh ? "老師親自分析你的命盤與故事，撰寫成約 10 頁的 PDF 報告。每一份都由真人親自完成，約需一天，再寄到申請時留下的信箱。一對一諮詢包含報告，也可以單獨購買報告。" : "상담자가 당신의 명식과 사연을 직접 분석해 약 10페이지 분량의 PDF 리포트로 작성해요. 한 분 한 분 직접 분석하고 쓰기 때문에 약 하루가 걸립니다. 완성한 리포트는 신청할 때 남긴 이메일로 보내드려요. 1:1 상담에는 리포트가 포함되며, 따로 신청할 수도 있어요."}</p>
        <ul className="report-parts">{reportParts.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ul></div>
      <div className="report-visual"><Image className="report-artwork" src={reportArtwork} alt={zh ? "紫色星光下，水豚 Don 老師在溫暖燈光中閱讀攤開的書" : "보라색 별빛과 따뜻한 조명 아래 사주 책을 읽는 카피바라 돈쌤"} sizes="(max-width: 767px) 90vw, 560px" placeholder="blur" /></div>
    </section>
    <div className="shell">{FREE_READING_ENABLED && <section id="free-reading" className="section free-reading-section"><div className="free-reading-intro"><div><p className="tiny-label muted">05 / A SMALL BEGINNING</p><h2>{zh ? "先從認識自己的五行開始。" : "나를 알아가는 작은 시작."}</h2><p>{zh ? "輸入生日，免費看看你的八字與五行。" : "상담 전에, 생년월일로 나의 사주와 오행을 가볍게 살펴보세요."}</p></div>
      <form className="mini-form" onSubmit={event=>{event.preventDefault();try{sessionStorage.setItem("luun-start-birth",birth);}catch{}window.location.assign(localPath(locale,"/read"));}}><label className="form-intro" htmlFor="quick-birth-year">{zh ? "陽曆出生日期" : "양력 생년월일"}<span className="pill">FREE</span></label><div className="mini-form-row"><BirthFields value={birth} onChange={setBirth} zh={zh} idPrefix="quick-birth" /><button className="primary-button" type="submit">{zh ? "免費看我的八字" : "무료로 내 사주 보기"}</button></div><p className="privacy-hint"><LockKeyhole size={13} />{zh ? "不需註冊 · 生日僅在瀏覽器中處理" : "회원가입 없이 · 생년월일은 내 브라우저에서만"}</p></form>
      </div><div className="reading-grid">{cards.map((c,i)=>{const Icon=Icons[i];return <a className="reading-tile" key={c[0]} href={localPath(locale,`/read?focus=${["self","love","work","daily"][i]}`)}><div className="tile-meta"><span>0{i+1} / {c[2]}</span><ArrowUpRight size={15} /></div><div className="tile-icon"><Icon /></div><h3>{c[0]}</h3><p>{c[1]}</p></a>;})}</div></section>}
      <section className="section journal-section" data-reveal><div className="section-heading"><div><h2>{zh ? "Don 老師的八字筆記" : "돈쌤의 사주 노트"}</h2></div><a href={localPath(locale,"/journal")} className="text-link"><BookOpen size={15} />{zh ? "閱讀全部" : "노트 모두 읽기"}</a></div><div className="journal-grid">{featuredArticles.map((article, index)=><JournalCard key={article.slug} article={article} locale={locale} sizes={index === 0 ? "(max-width: 767px) 90vw, 640px" : "(max-width: 767px) 90vw, (max-width: 1100px) 40vw, 260px"} />)}</div></section>
      <section className="closing-note" data-reveal><BrandMascot size={128} className="closing-mascot" /><p>{zh ? "願下一步，更靠近你想要的自己。" : "다음 선택은, 조금 더 나답게."}</p><a className="text-link" href={localPath(locale, "/book")}>{zh ? "預約一對一諮詢" : "1:1 상담 예약하기"}<ArrowUpRight size={17} /></a></section>
    </div>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteSchema).replace(/</g,"\\u003c")}} /><SiteFooter locale={locale} /></>;
}
