"use client";
import { useState } from "react";
import { ArrowUpRight, Leaf, Heart, Compass, Moon, Globe2, LockKeyhole, BookOpen, Menu, MessageCircle, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { BRAND, KAKAO_URL, homePath, localPath, websiteSchema, type Locale } from "@/lib/brand";
import { BrandMascot } from "./brand-mascot";

export function Logo() {
  return <span className="wordmark"><BrandMascot portrait size={48} className="wordmark-mascot" /><span className="wordmark-type"><strong>{BRAND.name}</strong><span>{BRAND.english}</span></span></span>;
}
export function SiteHeader({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  const nav = [
    [homePath(locale) + "#story", zh ? "品牌故事" : "마이까치 이야기"],
    [homePath(locale) + "#consultation", zh ? "諮詢方式" : "상담 안내"],
    [localPath(locale, "/read"), zh ? "免費八字" : "무료 사주"],
    [localPath(locale, "/journal"), zh ? "日常專欄" : "까치의 편지"],
  ];
  return <header className="site-header"><div className="shell header-inner">
    <a href={homePath(locale)} aria-label={zh ? "MY KKACHI 首頁" : "마이까치 홈"}><Logo /></a>
    <nav className="site-nav" aria-label={zh ? "主要導覽" : "주 메뉴"}>{nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
    <div className="header-tools">
      <a className="language" href={zh ? "/" : "/zh-TW"} aria-label={zh ? "切換至韓文" : "번체 중국어로 변경"}><Globe2 size={16} />{zh ? "한국어" : "繁體中文"}</a>
      <a className="outline-button" href={homePath(locale) + "#consultation"}>{zh ? "一對一諮詢" : "1:1 상담 안내"}<ArrowUpRight size={15} /></a>
      <Sheet><SheetTrigger className="mobile-menu" aria-label={zh ? "開啟選單" : "메뉴 열기"}><Menu size={21} /></SheetTrigger>
        <SheetContent><SheetTitle className="px-6 pt-8">{BRAND.english}</SheetTitle><SheetDescription className="px-6">{zh ? BRAND.chinese : BRAND.slogan}</SheetDescription><nav className="flex flex-col gap-6 p-6">{nav.map(([href,label]) => <SheetClose asChild key={href}><a href={href}>{label}</a></SheetClose>)}</nav></SheetContent>
      </Sheet>
    </div>
  </div></header>;
}
export function SiteFooter({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  const [policy, setPolicy] = useState("");
  const privacy = zh
    ? "免費排盤所用的生日、出生時間與暱稱僅在瀏覽器中處理，不儲存在伺服器。本網站不將排盤輸入傳送至伺服器，亦不提供站內會員註冊。管理員登入使用安全 Cookie，內容與營運設定儲存於資料庫。KakaoTalk 諮詢為獨立服務，個人資料使用方式將於預約前說明。"
    : "무료 사주에 입력한 생년월일·출생시간·닉네임은 브라우저에서 계산하며 서버에 저장하지 않습니다. 입력한 출생 정보를 서버로 전송하지 않으며 사이트 내 회원가입은 없습니다. 관리자 로그인에는 보안 쿠키를 사용하며, 콘텐츠와 운영 설정은 데이터베이스에 저장합니다. 카카오톡 상담은 별도 서비스로, 상담 정보의 이용·보관 안내는 예약 전에 제공합니다.";
  const terms = zh
    ? "免費八字排盤採陽曆、節氣換年月、午夜換日，不做真太陽時校正。解讀以文化體驗與自我探索為目的。一對一諮詢採 KakaoTalk 文字對話，預約前會說明費用、時間與取消退款規則，確認後再以銀行轉帳付款。網站不提供自動扣款。"
    : "무료 사주는 양력·절입 기준 연월주와 자정 기준 일주를 사용하며 진태양시 보정을 적용하지 않습니다. 해석은 문화적 경험과 자기 이해를 위한 참고입니다. 1:1 상담은 카카오톡 대화로 진행하며 비용·일정·취소 및 환불 기준을 안내받고 확인한 뒤 계좌이체로 결제하는 방식입니다. 사이트 내 자동 결제는 제공하지 않습니다.";
  return <><footer className="site-footer"><div className="shell">
    <div className="footer-top"><a href={homePath(locale)} aria-label={zh ? "MY KKACHI 首頁" : "마이까치 홈"}><Logo /></a>
      <div className="footer-links"><a href={homePath(locale)+"#story"}>{zh ? "品牌故事" : "마이까치 이야기"}</a><button onClick={() => setPolicy("privacy")}>{zh ? "隱私說明" : "개인정보 안내"}</button><button onClick={() => setPolicy("terms")}>{zh ? "使用說明" : "이용 안내"}</button><a href="/admin">Studio</a></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} MY KKACHI. A little bird, by your side.</span><span>{zh ? "命理是一種自我探索，不是對未來的保證。" : "사주는 나를 이해하는 하나의 관점이며, 미래를 보장하지 않습니다."}</span></div>
  </div></footer><Dialog open={!!policy} onOpenChange={() => setPolicy("")}><DialogContent><DialogTitle>{policy === "privacy" ? (zh ? "隱私說明" : "개인정보 안내") : (zh ? "使用說明" : "이용 안내")}</DialogTitle><DialogDescription className="dialog-copy">{policy === "privacy" ? privacy : terms}</DialogDescription></DialogContent></Dialog></>;
}
export function HomePage({ locale }: { locale: Locale }) {
  const zh = locale === "zh-TW";
  const [birth, setBirth] = useState("");
  const cards = zh ? [
    ["我的五行", "認識與生俱來的性格與節奏", "基礎命盤"], ["關係的溫度", "理解彼此不同的表達方式", "感情與關係"], ["工作的方向", "探索適合自己的做事方式", "事業與自我"], ["給自己的提問", "從五行開始今天的練習", "日常練習"],
  ] : [
    ["나를 이루는 다섯 가지", "타고난 기질과 나만의 속도를 읽어요", "나의 오행"], ["우리 사이의 온도", "서로 다른 마음의 언어를 이해해요", "연애와 관계"], ["나답게 일하는 방법", "내게 맞는 일의 방식을 찾아요", "일과 가능성"], ["오늘, 나에게 건네는 말", "내 기질을 돌보는 작은 실천을 만나요", "일상의 힌트"],
  ];
  const Icons = [Leaf, Heart, Compass, Moon];
  const journals = zh ? [
    ["five-elements", "木", "五行，不是性格的標籤", "讀懂五行，從認識自己開始", "五行入門"], ["birth-time", "時", "不知道出生時間，也能排八字嗎？", "哪些部分仍可參考？", "八字指南"], ["relationship", "緣", "合不合，不只看一個字", "理解關係，從理解差異開始", "關係筆記"],
  ] : [
    ["five-elements", "木", "오행, 나를 이루는 다섯 가지 언어", "내 사주에 나무가 많다는 건 무슨 뜻일까?", "사주 입문"], ["birth-time", "時", "태어난 시간을 몰라도 괜찮을까요?", "시간을 몰라도 알 수 있는 것들", "사주 가이드"], ["relationship", "緣", "잘 맞는 사이에도 다른 점은 있어요", "오행으로 읽는 서로의 마음 표현법", "관계 이야기"],
  ];
  const promises = zh ? [
    ["先聽你說", "不必把煩惱整理得很完整。從你現在最在意的事，慢慢開始。"], ["用懂得的話說明", "把八字的象徵，連結到你的經歷與日常，讓對話容易理解。"], ["把選擇留給你", "一起梳理值得思考的方向，讓你帶著自己的步調走向明天。"],
  ] : [
    ["먼저, 충분히 들어요", "고민을 잘 정리해 오지 않아도 괜찮아요. 지금 가장 마음에 걸리는 이야기부터 시작해요."], ["알아들을 수 있게 풀어요", "낯선 명리 용어를 일상의 말로 바꾸고, 당신이 겪고 있는 상황과 함께 살펴요."], ["선택은 당신에게 남겨요", "상담 끝에는 더 생각해 볼 질문과 방향을 정리해요. 다음 걸음은 당신의 속도로 내디뎌요."],
  ];
  const steps = zh ? [
    ["聊聊你的問題", "透過 KakaoTalk 說明想聊的主題，確認可預約的時間。"], ["確認後，再付款", "先確認費用、諮詢範圍與取消退款規則，再依提供的帳戶資訊轉帳。"], ["開始一對一對話", "在約定的時間，由諮詢者本人透過 KakaoTalk 文字對話，陪你梳理想法。"],
  ] : [
    ["카톡으로 이야기 건네기", "궁금한 주제를 알려주세요. 상담 가능한 일정과 필요한 정보를 안내해 드려요."], ["안내 확인 후 계좌이체", "상담 비용·범위·일정·취소 및 환불 기준을 먼저 확인하고, 안내받은 계좌로 입금해요."], ["약속한 시간에 1:1 대화", "상담자가 직접 카카오톡으로 이야기를 나누며, 사주와 지금의 고민을 함께 살펴요."],
  ];
  return <><SiteHeader locale={locale} /><main className="brand-home">
    <section className="shell hero">
      <div className="hero-copy"><p className="eyebrow"><span className="status-dot" />{zh ? "KakaoTalk 一對一八字諮詢" : "당신의 이야기를 듣는 1:1 사주 상담"}</p>
        <h1>{zh ? <>聽你說故事，<br /><em>陪你看明天。</em></> : <>내 이야기를 듣고,<br /><em>내일을 함께 살피다.</em></>}</h1>
        <p className="hero-description">{zh ? <>把獨自放在心裡的話，慢慢說出來。<br />從你的八字與此刻的心情，一起找方向。</> : <>혼자 품고 있던 이야기, 여기서 잠시 내려놓아요.<br />당신의 사주와 지금의 고민을 차분히 함께 읽습니다.</>}</p>
        <div className="hero-actions"><a className="primary-button" href="#consultation">{zh ? "了解一對一諮詢" : "1:1 상담 알아보기"}<ArrowUpRight size={18} /></a><a className="text-link" href="#free-reading">{zh ? "先免費看八字" : "내 사주 먼저 살펴보기"}<ArrowRight size={16} /></a></div>
        <div className="hero-signature"><span className="signature-line" /><span>{zh ? "一隻小喜鵲，陪在你身旁。" : "내 곁의 작은 까치, 마이까치"}</span></div>
      </div>
      <figure className="hero-art mascot-hero"><BrandMascot size={560} className="hero-mascot" priority sizes="(max-width: 600px) 90vw, (max-width: 1100px) 45vw, 540px" alt={zh ? "圓圓的 3D 小喜鵲，揮著青綠色翅膀向你打招呼" : "청록색 날개를 흔들며 인사하는 동글동글한 3D 마이까치"} /><figcaption className="hero-art-caption"><span className="tiny-label">YOUR LITTLE KKACHI</span><span>{zh ? "你好，今天想聊聊什麼呢？" : "안녕, 오늘은 어떤 마음으로 왔나요?"}</span></figcaption></figure>
    </section>
    <div className="shell"><div className="editorial-strip"><span className="strip-pill">MY KKACHI</span><p>{zh ? "不急著找出答案，也可以先說說心裡的話。" : "답을 서두르지 않아도 괜찮아요. 마음의 이야기부터 시작해요."}</p><span className="en">A NOTE FOR TOMORROW ↗</span></div></div>
    <section id="story" className="shell story-section" aria-labelledby="story-title">
      <div className="story-heading"><p className="tiny-label muted">01 / OUR STORY</p><h2 id="story-title">{zh ? <>等待好消息的心，<br />也需要陪伴。</> : <>좋은 소식을 기다리는<br />마음 곁으로.</>}</h2><div className="story-note mascot-story-note"><BrandMascot portrait size={76} /><div><p>{zh ? "「慢慢說，我在這裡聽。」" : "“천천히 말해요. 여기서 듣고 있을게요.”"}</p><span className="tiny-label">— YOUR KKACHI</span></div></div></div>
      <div className="story-copy"><p>{zh ? "在韓國，喜鵲承載著迎接喜訊與訪客的想像。MY KKACHI 從這份期待出發，想做一隻陪在你身邊的小喜鵲。" : "한국에서 까치는 반가운 소식을 전하는 새로 여겨져 왔어요. 마이까치는 그 다정한 기다림에서 시작했습니다. 좋은 소식을 기다리는 당신 곁에, 작은 새 한 마리가 앉는 상상으로요."}</p>
        <p>{zh ? "故事裡的小喜鵲，會在有人睡不著的夜裡停在窗邊。牠不催促，也不打斷，只陪著人們，把心裡折起來的話，一句一句展開。" : "마이까치의 작은 까치는 누군가 잠들지 못하는 밤이면 창가에 내려앉아요. 재촉하지 않고, 말을 끊지 않고, 마음속에 접어둔 이야기가 한 문장씩 펼쳐지기를 기다립니다."}</p>
        <p className="story-emphasis">{zh ? "我們也想這樣聽你說。以八字為起點，陪你梳理此刻的困惑，看見下一步的方向。" : "우리의 상담도 그렇게 시작해요. 사주를 실마리 삼아 지금의 마음을 듣고, 내일의 선택을 함께 살피는 일. 그 시간이 당신에게 작은 쉼이 되었으면 합니다."}</p>
        <p className="story-source">{zh ? "小喜鵲的情節是品牌創作，靈感來自韓國的喜鵲文化。" : "작은 까치의 이야기는 한국의 까치 상징에서 영감을 얻은 브랜드 창작입니다."} <a href="https://encykorea.aks.ac.kr/Article/E0011213" target="_blank" rel="noreferrer">{zh ? "文化來源 ↗" : "문화적 배경 ↗"}</a></p>
      </div>
    </section>
    <section className="shell promise-section" aria-label={zh ? "我們的約定" : "마이까치의 약속"}><div className="promise-grid">{promises.map(([title,body],i)=><article key={title}><span className="promise-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="consultation" className="consultation-section" aria-labelledby="consultation-title"><div className="shell"><div className="consultation-top"><div><p className="tiny-label">02 / A CONVERSATION FOR YOU</p><h2 id="consultation-title">{zh ? <>透過一段對話，<br />慢慢靠近自己。</> : <>혼자 맴돌던 고민을,<br />함께 나누는 시간.</>}</h2></div><div className="consultation-intro"><p>{zh ? "感情、工作，或難以說清楚的心情。由諮詢者本人，以 KakaoTalk 文字對話陪你一起看八字。" : "연애와 관계, 일과 진로, 말로 설명하기 어려웠던 마음까지. 상담자가 직접 카카오톡으로 당신의 이야기를 듣습니다."}</p><span className="consultation-chip"><MessageCircle size={16} />{zh ? "KakaoTalk 文字諮詢 · 銀行轉帳" : "카카오톡 1:1 대화 · 계좌이체"}</span></div></div>
      <ol className="consultation-steps">{steps.map(([title,body],i)=><li key={title}><span className="step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      <div className="consultation-action">{KAKAO_URL ? <a className="primary-button" href={KAKAO_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />{zh ? "透過 KakaoTalk 詢問" : "카카오톡으로 상담 문의"}<ArrowUpRight size={17} /></a> : <><span className="consultation-status">{zh ? "一對一諮詢即將開放" : "1:1 상담 오픈 준비 중"}</span><p>{zh ? "目前尚未開放預約與付款。你可以先免費查看自己的八字。" : "현재 예약과 입금은 받지 않아요. 먼저 무료 사주로 나의 기질을 살펴보세요."}</p><a className="text-link" href="#free-reading">{zh ? "免費看我的八字" : "무료 사주 살펴보기"}<ArrowRight size={16} /></a></>}</div>
    </div></section>
    <div className="shell"><section id="free-reading" className="section free-reading-section"><div className="free-reading-intro"><div><p className="tiny-label muted">03 / A SMALL BEGINNING</p><h2>{zh ? "先從認識自己的五行開始。" : "나를 알아가는 작은 시작."}</h2><p>{zh ? "輸入生日，免費看看你的八字與五行。" : "생년월일로 나의 사주와 오행을 가볍게 살펴보세요."}</p></div>
      <form className="mini-form" onSubmit={event=>{event.preventDefault();try{sessionStorage.setItem("luun-start-birth",birth);}catch{}window.location.assign(localPath(locale,"/read"));}}><label className="form-intro" htmlFor="quick-birth">{zh ? "陽曆出生日期" : "양력 생년월일"}<span className="pill">FREE</span></label><div className="mini-form-row"><input id="quick-birth" type="date" value={birth} onChange={e=>setBirth(e.target.value)} min="1970-01-01" max={new Date().toISOString().slice(0,10)} required /><button className="primary-button" type="submit">{zh ? "免費看我的八字" : "무료로 내 사주 보기"}</button></div><p className="privacy-hint"><LockKeyhole size={13} />{zh ? "不需註冊 · 生日僅在瀏覽器中處理" : "회원가입 없이 · 생년월일은 내 브라우저에서만"}</p></form>
      </div><div className="reading-grid">{cards.map((c,i)=>{const Icon=Icons[i];return <a className="reading-tile" key={c[0]} href={localPath(locale,`/read?focus=${["self","love","work","daily"][i]}`)}><div className="tile-meta"><span>0{i+1} / {c[2]}</span><ArrowUpRight size={15} /></div><div className="tile-icon"><Icon /></div><h3>{c[0]}</h3><p>{c[1]}</p></a>;})}</div></section>
      <section className="section journal-section"><div className="section-heading"><div><p className="tiny-label muted">LETTERS FROM KKACHI</p><h2>{zh ? "喜鵲寄來的日常筆記" : "까치가 건네는 일상의 편지"}</h2></div><a href={localPath(locale,"/journal")} className="text-link"><BookOpen size={15} />{zh ? "閱讀全部" : "편지 모두 읽기"}</a></div><div className="journal-grid">{journals.map((j,i)=><a href={localPath(locale,`/journal/${j[0]}`)} className="journal-card" key={j[0]}><div className={`journal-cover c${i}`}><span className="tiny-label">MY KKACHI / LETTER 0{i+1}</span><span className="serif">{j[2]}</span><span className="cover-character">{j[1]}</span></div><h3>{j[3]}</h3><p>{j[4]} · {zh ? "3 分鐘閱讀" : "3분 읽기"}</p></a>)}</div></section>
      <section className="closing-note"><BrandMascot size={128} className="closing-mascot" /><p>{zh ? "願你離開時，心裡多一點餘裕。" : "돌아가는 마음에, 작은 여유가 남기를."}</p><span className="tiny-label">WITH LOVE, MY KKACHI</span></section>
    </div>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteSchema).replace(/</g,"\\u003c")}} /><SiteFooter locale={locale} /></>;
}
