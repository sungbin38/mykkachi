"use client";
import { useState } from "react";
import { ArrowUpRight, Leaf, Heart, Compass, Moon, Globe2, LockKeyhole, BookOpen, Menu, ArrowRight, Check, Bot, UserRound, Clock3, Mail, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { BRAND, homePath, localPath, websiteSchema, type Locale } from "@/lib/brand";
import { BrandMascot } from "./brand-mascot";
import { FeaturedReviews } from "./reviews";
import { BirthFields } from "./birth-fields";

export function Logo() {
  return <span className="wordmark"><BrandMascot portrait size={48} className="wordmark-mascot" /><span className="wordmark-type"><strong>{BRAND.name}</strong><span>{BRAND.english}</span></span></span>;
}
export function SiteHeader({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  const nav = [
    [homePath(locale) + "#story", zh ? "品牌故事" : "마이까치 이야기"],
    [homePath(locale) + "#consultation", zh ? "諮詢方式" : "상담 안내"],
    ...(!zh ? [["/book", "상담 예약"]] : []),
    ...(!zh ? [["/reviews", "상담 이야기"]] : []),
    [localPath(locale, "/read"), zh ? "免費八字" : "무료 사주"],
    [localPath(locale, "/journal"), zh ? "日常專欄" : "까치의 편지"],
  ];
  return <header className="site-header"><div className="shell header-inner">
    <a href={homePath(locale)} aria-label={zh ? "MY KKACHI 首頁" : "마이까치 홈"}><Logo /></a>
    <nav className="site-nav" aria-label={zh ? "主要導覽" : "주 메뉴"}>{nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
    <div className="header-tools">
      <a className="language" href={zh ? "/" : "/zh-TW"} aria-label={zh ? "切換至韓文" : "번체 중국어로 변경"}><Globe2 size={16} />{zh ? "한국어" : "繁體中文"}</a>
      <a className="outline-button" href={zh ? "/zh-TW#consultation" : "/book"}>{zh ? "一對一諮詢" : "상담 예약"}<ArrowUpRight size={15} /></a>
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
    ? "免費排盤所用的生日、出生時間與暱稱僅在瀏覽器中處理，不儲存在伺服器。網站僅累計匿名事件次數，不記錄生日、IP 或使用者識別碼。預約諮詢時填寫的姓名、電子郵件、聯絡方式、出生資料與故事，僅用於預約確認、諮詢與寄送報告，並儲存在伺服器；諮詢後可要求刪除。管理後台需密碼登入，內容草稿儲存在伺服器。"
    : "무료 사주에 입력한 생년월일·출생시간·닉네임은 브라우저에서 계산하며 서버에 저장하지 않습니다. 페이지별 익명 이벤트 횟수만 집계하며 생년월일·IP·사용자 식별자를 저장하지 않습니다. 상담 예약 시 입력한 이름·이메일·연락처·출생 정보·사연은 예약 확인과 상담, 리포트 발송에만 사용하며 서버에 저장됩니다. 상담 뒤 삭제를 요청하시면 지워드립니다. 관리자 콘텐츠 초안도 서버에 저장됩니다.";
  const terms = zh
    ? "免費八字排盤採陽曆、節氣換年月、午夜換日，不做真太陽時校正。解讀以文化體驗與自我探索為目的。一對一諮詢由諮詢者本人在預約的一小時內進行，費用、進行方式與取消退款規則將於預約確認信中說明，確認後再以銀行轉帳付款。諮詢後以電子郵件寄送八字報告。網站不提供自動扣款。"
    : "무료 사주는 양력·절입 기준 연월주와 자정 기준 일주를 사용하며 진태양시 보정을 적용하지 않습니다. 해석은 문화적 경험과 자기 이해를 위한 참고입니다. 1:1 상담은 예약한 1시간 동안 상담자가 직접 진행하며, 비용·진행 방법·취소 및 환불 기준은 예약 확인 메일로 안내받고 확인한 뒤 계좌이체로 결제하는 방식입니다. 상담 뒤 사주 리포트는 이메일로 보내드립니다. 사이트 내 자동 결제는 제공하지 않습니다.";
  return <><footer className="site-footer"><div className="shell">
    <div className="footer-top"><a href={homePath(locale)} aria-label={zh ? "MY KKACHI 首頁" : "마이까치 홈"}><Logo /></a>
      <div className="footer-links"><a href={homePath(locale)+"#story"}>{zh ? "品牌故事" : "마이까치 이야기"}</a>{!zh && <a href="/book">상담 예약</a>}{!zh && <a href="/reviews">상담 이야기</a>}<button onClick={() => setPolicy("privacy")}>{zh ? "隱私說明" : "개인정보 안내"}</button><button onClick={() => setPolicy("terms")}>{zh ? "使用說明" : "이용 안내"}</button></div>
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
  const aiSamples = zh ? [
    ["「我的日柱是什麼？」", "你的日柱是戊辰……", "昨天問同一題，答案卻不一樣。"], ["「這個月該怎麼過？」", "整體平穩順利，保持好心情就會有好事。", "所以到底該在什麼時候、做什麼？"], ["「幫我分析性格。」", "你有領導力，但偶爾內向，還有別人不知道的細膩。", "這句話對誰都說得通。"],
  ] : [
    ["“제 일주가 뭐예요?”", "당신의 일주는 무진일주입니다. 성실하고 듬직한…", "어제 같은 질문엔 다른 답이 나왔어요."], ["“이번 달 어떻게 보내요?”", "전반적으로 무난한 달입니다. 좋은 마음을 유지하세요!", "그래서 언제, 무엇을 하라는 걸까요?"], ["“제 성격 분석해 주세요.”", "리더십이 있지만 가끔 내향적이고, 섬세함을 지녔습니다.", "누구에게나 맞는 말이에요."],
  ];
  const ours = zh ? [
    ["由人親自排盤、親自讀", "諮詢者會先核對你的年月日時四柱，再從你的生活脈絡解讀，不是自動生成的句子。"], ["把你的故事放進命盤裡", "預約時留下的煩惱，會在對話前先讀過。八字只是線索，重點是你此刻的處境。"], ["留下一份能回頭看的報告", "諮詢後，把談到的內容整理成報告寄到你的信箱，之後隨時可以再讀。"],
  ] : [
    ["사람이 직접 명식을 세우고 읽어요", "상담자가 연·월·일·시 네 기둥을 먼저 확인하고, 당신의 상황에 맞춰 풀어요. 자동으로 생성된 문장이 아니에요."], ["당신의 사연을 명식 안에 놓고 봐요", "예약할 때 남긴 고민을 상담 전에 미리 읽어요. 사주는 실마리이고, 중심은 지금 당신이 겪는 일이에요."], ["다시 꺼내 읽을 수 있는 리포트를 남겨요", "상담이 끝나면 나눈 이야기를 정리해 이메일로 보내드려요. 시간이 지나 다시 읽어도 괜찮도록요."],
  ];
  const steps = zh ? [
    ["選擇日期與時間", "以一小時為單位，挑選你方便的時段。"], ["留下基本資料", "出生年月日與時間、想聊的主題。想先說的故事可以一併留下，選填。"], ["轉帳後確認", "將諮詢費用 10 萬韓元轉入指定帳戶，諮詢者確認後寄出確定通知。到了約定時間，由本人親自與你對話。"], ["收到八字報告", "諮詢結束後，把談到的內容整理成報告寄到你的信箱。"],
  ] : [
    ["날짜와 시간 고르기", "1시간 단위로 열린 시간 중에서 편한 때를 골라요."], ["나에 대해 알려주기", "생년월일과 태어난 시간, 나누고 싶은 주제를 남겨요. 미리 전하고 싶은 사연은 선택이에요."], ["입금하고 확정", "상담 비용 10만원을 안내한 계좌로 입금하면 상담자가 확인하고 확정 메일을 보내요. 약속한 시간에 상담자가 직접 이야기를 나눠요."], ["사주 리포트 받기", "상담이 끝나면 나눈 이야기를 정리한 리포트를 이메일로 보내드려요."],
  ];
  const reportParts = zh ? [
    ["日柱", "你的名牌：與生俱來的性格與傾向"], ["格局", "你天生的「武器」與使用方式"], ["大運流向", "每十年的環境變化，以及該留意的事"], ["要小心的事", "關係、健康、金錢上需要注意的訊號"], ["開運方法", "數字、運動、植物、食物：日常的小習慣"], ["方向與顏色", "搬家、旅行、工作可參考的方位與衣著"], ["與你合得來的人", "容易相處的日柱"], ["提醒", "寫給你的最後一段話"],
  ] : [
    ["일주", "나의 이름표. 타고난 성격과 성향"], ["격국", "타고난 나의 무기와 쓰는 법"], ["대운 흐름", "10년 단위로 바뀌는 환경과 그때 살필 것"], ["조심할 것", "관계·건강·돈에서 눈여겨볼 신호"], ["개운법", "숫자, 운동, 식물, 음식. 일상의 작은 습관"], ["방향과 색", "이사·여행·일에 참고할 방위와 옷 색"], ["나와 맞는 사람", "편하게 어울리는 일주"], ["유의점", "당신에게 남기는 마지막 한마디"],
  ];
  return <><SiteHeader locale={locale} /><main className="brand-home">
    <section className="shell hero">
      <div className="hero-copy"><p className="eyebrow"><span className="status-dot" />{zh ? "由人親自解讀的一對一八字諮詢" : "AI가 아닌, 사람이 직접 읽는 1:1 사주 상담"}</p>
        <h1>{zh ? <>聽你說故事，<br /><em>陪你看明天。</em></> : <>내 이야기를 듣고,<br /><em>내일을 함께 살피다.</em></>}</h1>
        <p className="hero-description">{zh ? <>自動生成的句子，讀不出你的人生節奏。<br />諮詢者親自排盤、親自讀，並在諮詢後把整理好的報告寄給你。</> : <>자동으로 만들어진 문장은 당신 삶의 타이밍을 읽지 못해요.<br />상담자가 직접 명식을 세우고 읽고, 상담 뒤 정리한 리포트를 이메일로 보내드립니다.</>}</p>
        <div className="hero-actions"><a className="primary-button" href={zh ? "#consultation" : "/book"}>{zh ? "了解一對一諮詢" : "상담 예약하기"}<ArrowUpRight size={18} /></a><a className="text-link" href="#free-reading">{zh ? "先免費看八字" : "내 사주 먼저 살펴보기"}<ArrowRight size={16} /></a></div>
        <ul className="hero-footnotes">{(zh ? ["一小時一對一", "以你的故事為中心", "諮詢後寄送報告"] : ["1시간 1:1 상담", "당신의 사연을 중심으로", "상담 후 리포트 이메일"]).map((t) => <li key={t}><Check size={13} />{t}</li>)}</ul>
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
    <section id="why" className="why-section" aria-labelledby="why-title"><div className="shell">
      <div className="why-heading"><p className="tiny-label">02 / WHY A PERSON</p><h2 id="why-title">{zh ? <>聊天機器人給的八字，<br />真的說中過你的人生嗎？</> : <>챗봇이 뽑아준 사주,<br />정말 내 삶에 맞은 적 있었나요?</>}</h2><p>{zh ? "把網路上的詞條拼起來，寫不出一個人的脈絡。MY KKACHI 不用自動生成的文字，而是由一個人，為另一個人，慢慢讀。" : "인터넷의 단어들을 이어 붙인 문장으로는 한 사람의 맥락을 읽을 수 없어요. 마이까치는 자동 생성 문장 대신, 한 사람이 한 사람을 위해 천천히 읽습니다."}</p></div>
      <div className="why-grid">
        <div className="why-col ai"><p className="why-col-label"><Bot size={15} />{zh ? "常見的 AI 八字" : "흔한 AI 사주"}</p>{aiSamples.map(([q, a, note]) => <div className="why-chat" key={q}><p className="why-q">{q}</p><p className="why-a">{a}</p><p className="why-note">← {note}</p></div>)}<p className="why-footnote">{zh ? "* 重現常見自動生成回答的限制，非特定服務的實際對話。" : "* 흔한 자동 생성 답변의 한계를 재구성한 예시이며, 특정 서비스의 실제 대화가 아닙니다."}</p></div>
        <div className="why-col ours"><p className="why-col-label"><UserRound size={15} />{zh ? "MY KKACHI 的方式" : "마이까치의 방식"}</p>{ours.map(([t, b], i) => <article key={t}><span className="promise-number">0{i + 1}</span><h3>{t}</h3><p>{b}</p></article>)}</div>
      </div>
    </div></section>
    <section className="shell promise-section" aria-label={zh ? "我們的約定" : "마이까치의 약속"}><div className="promise-grid">{promises.map(([title,body],i)=><article key={title}><span className="promise-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="consultation" className="consultation-section" aria-labelledby="consultation-title"><div className="shell"><div className="consultation-top"><div><p className="tiny-label">03 / HOW IT WORKS</p><h2 id="consultation-title">{zh ? <>預約一小時，<br />把心裡的事慢慢說。</> : <>한 시간을 예약하고,<br />마음의 이야기를 꺼내요.</>}</h2></div><div className="consultation-intro"><p>{zh ? "感情、工作，或難以說清楚的心情。選一個時段，留下出生資料與想聊的事，諮詢者會親自確認並與你對話。諮詢後，把談到的內容整理成報告寄給你。" : "연애, 일, 혹은 말로 잘 정리되지 않는 마음. 시간을 고르고 출생 정보와 나누고 싶은 이야기를 남기면, 상담자가 직접 확인하고 이야기를 나눠요. 상담이 끝나면 정리한 리포트를 보내드립니다."}</p><p className="consultation-chip"><Clock3 size={14} />{zh ? "每次一小時 · 10 萬韓元 · 轉帳" : "회당 1시간 · 10만원 · 계좌이체"}<span>·</span><Mail size={14} />{zh ? "諮詢後寄送 PDF 報告" : "상담 후 PDF 리포트 이메일"}</p></div></div>
      <ol className="consultation-steps four">{steps.map(([title,body],i)=><li key={title}><span className="step-number">STEP 0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      <div className="consultation-action">{zh ? <><span className="consultation-status">目前僅開放韓文諮詢</span><p>繁體中文諮詢開放時會在此公告。你可以先免費查看自己的八字。</p></> : <><a className="primary-button" href="/book"><CalendarDays size={18} />상담 시간 고르러 가기<ArrowUpRight size={17} /></a><p>상담 비용 10만원 · 계좌이체 입금 확인 후 예약 확정 · 사이트에서 결제하지 않아요.</p></>}</div>
    </div></section>
    {!zh && <FeaturedReviews />}
    <section id="report" className="shell report-section" aria-labelledby="report-title">
      <div className="report-intro"><p className="tiny-label muted">04 / THE REPORT</p><h2 id="report-title">{zh ? <>諮詢結束後，<br />一份可以回頭再讀的報告。</> : <>상담이 끝나면,<br />다시 꺼내 읽을 수 있는 리포트.</>}</h2><p>{zh ? "談過的內容不會只留在記憶裡。諮詢者會把你的命盤與對話整理成報告，寄到預約時留下的信箱。" : "나눈 이야기가 기억 속에만 남지 않도록, 상담자가 당신의 명식과 대화를 정리한 리포트를 예약 때 남긴 이메일로 보내드려요."}</p>
        <ul className="report-parts">{reportParts.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ul></div>
      <figure className="report-preview" aria-label={zh ? "報告範例" : "리포트 예시"}>
        <div className="report-page"><span className="tiny-label">MY KKACHI · REPORT</span>
          <h3>{zh ? "八字基本解讀" : "사주 기본 풀이"}</h3>
          <p className="report-label">{zh ? "日柱" : "일주"}</p>
          <p>{zh ? "日柱像是你的名牌，代表與生俱來的性格與傾向。你的日柱是——" : "일주는 당신이 무엇으로 태어났는지 알려주는 이름표 같은 기운이에요. 당신의 일주는 ——"}</p>
          <p className="report-label">{zh ? "大運流向" : "대운 흐름"}</p>
          <p>{zh ? "大運每十年轉一次。在這個時期，請把心力分給工作、關係與生活三處，不要只偏向一邊——" : "대운은 10년 단위로 바뀌어요. 이 시기에는 일과 관계, 삶의 중심에 에너지를 나눠 두세요. 한쪽으로만 기울지 않도록——"}</p>
          <p className="report-label">{zh ? "開運方法" : "개운법"}</p>
          <p>{zh ? "散步與登山、客廳裡的一株圓葉植物、一條圍巾——" : "가벼운 산책과 등산, 거실의 둥근잎 식물 한 그루, 스카프 하나——"}</p>
          <span className="report-fade" /></div>
        <figcaption>{zh ? "報告以 PDF 寄出。內容依每個人的命盤與諮詢而不同。" : "리포트는 PDF로 보내드려요. 내용은 사람마다, 상담마다 달라요."}</figcaption>
      </figure>
    </section>
    <div className="shell"><section id="free-reading" className="section free-reading-section"><div className="free-reading-intro"><div><p className="tiny-label muted">05 / A SMALL BEGINNING</p><h2>{zh ? "先從認識自己的五行開始。" : "나를 알아가는 작은 시작."}</h2><p>{zh ? "輸入生日，免費看看你的八字與五行。" : "상담 전에, 생년월일로 나의 사주와 오행을 가볍게 살펴보세요."}</p></div>
      <form className="mini-form" onSubmit={event=>{event.preventDefault();try{sessionStorage.setItem("luun-start-birth",birth);}catch{}window.location.assign(localPath(locale,"/read"));}}><label className="form-intro" htmlFor="quick-birth-year">{zh ? "陽曆出生日期" : "양력 생년월일"}<span className="pill">FREE</span></label><div className="mini-form-row"><BirthFields value={birth} onChange={setBirth} zh={zh} idPrefix="quick-birth" /><button className="primary-button" type="submit">{zh ? "免費看我的八字" : "무료로 내 사주 보기"}</button></div><p className="privacy-hint"><LockKeyhole size={13} />{zh ? "不需註冊 · 生日僅在瀏覽器中處理" : "회원가입 없이 · 생년월일은 내 브라우저에서만"}</p></form>
      </div><div className="reading-grid">{cards.map((c,i)=>{const Icon=Icons[i];return <a className="reading-tile" key={c[0]} href={localPath(locale,`/read?focus=${["self","love","work","daily"][i]}`)}><div className="tile-meta"><span>0{i+1} / {c[2]}</span><ArrowUpRight size={15} /></div><div className="tile-icon"><Icon /></div><h3>{c[0]}</h3><p>{c[1]}</p></a>;})}</div></section>
      <section className="section journal-section"><div className="section-heading"><div><p className="tiny-label muted">LETTERS FROM KKACHI</p><h2>{zh ? "喜鵲寄來的日常筆記" : "까치가 건네는 일상의 편지"}</h2></div><a href={localPath(locale,"/journal")} className="text-link"><BookOpen size={15} />{zh ? "閱讀全部" : "편지 모두 읽기"}</a></div><div className="journal-grid">{journals.map((j,i)=><a href={localPath(locale,`/journal/${j[0]}`)} className="journal-card" key={j[0]}><div className={`journal-cover c${i}`}><span className="tiny-label">MY KKACHI / LETTER 0{i+1}</span><span className="serif">{j[2]}</span><span className="cover-character">{j[1]}</span></div><h3>{j[3]}</h3><p>{j[4]} · {zh ? "3 分鐘閱讀" : "3분 읽기"}</p></a>)}</div></section>
      <section className="closing-note"><BrandMascot size={128} className="closing-mascot" /><p>{zh ? "願你離開時，心裡多一點餘裕。" : "돌아가는 마음에, 작은 여유가 남기를."}</p><span className="tiny-label">WITH LOVE, MY KKACHI</span></section>
    </div>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteSchema).replace(/</g,"\\u003c")}} /><SiteFooter locale={locale} /></>;
}
