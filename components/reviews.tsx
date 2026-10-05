"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronLeft, Menu, Phone, Search, UserRound } from "lucide-react";
import { getFeaturedReviews, getReviewStories, getReviewCategory, reviewCategories, type ReviewCategory, type ReviewStory } from "@/lib/reviews";
import { homePath, localPath, type Locale } from "@/lib/brand";
import { BrandMascot } from "./brand-mascot";

function Conversation({ story, locale }: { story: ReviewStory; locale: Locale }) {
  const zh = locale === "zh-TW";
  const messages = story.messages.filter(message => message.preview);
  return <div className={`review-chat review-chat-${story.theme}`} aria-label={zh ? `${story.clientName} 與喜鵲老師的諮詢對話` : `${story.clientName}님과 까치 선생님의 상담 대화`}>
    <div className="review-chat-header">
      <ChevronLeft size={22} aria-hidden="true" />
      <span className="review-avatar" aria-hidden="true">{story.clientName[0]}</span>
      <div className="review-chat-person"><strong>{story.clientName}</strong><span><UserRound size={12} aria-hidden="true" /> 2</span></div>
      <div className="review-chat-tools" aria-hidden="true"><Search size={18} /><Phone size={18} /><Menu size={21} /></div>
    </div>
    <div className="review-chat-body">
      {messages.map((message, index) => {
        const startsGroup = index === 0 || messages[index - 1].role !== message.role;
        return <div key={index} className={`review-message review-message-${message.role}${startsGroup ? " review-message-first" : ""}`}>
          {startsGroup && <span className="review-sender">{message.role === "client" ? story.clientName : zh ? "喜鵲老師" : "까치 선생님"}</span>}
          <div className="review-bubble-row"><p className="review-bubble">{message.text}</p>{message.time && <span className="review-message-time">{message.time}</span>}</div>
        </div>;
      })}
    </div>
  </div>;
}

function ReviewCard({ story, locale, preview = false }: { story: ReviewStory; locale: Locale; preview?: boolean }) {
  const zh = locale === "zh-TW";
  return <article className={`review-card${preview ? " review-card-preview" : ""}`} id={`story-${story.id}`}>
    <Conversation story={story} locale={locale} />
    <div className="review-card-info">
      <div className="review-card-meta"><span className="review-client-name">{story.clientName}{!zh && "님"}</span><span className="review-topic">{story.topic}</span></div>
      <h3>{story.title}</h3>
      <div className="review-card-bottom"><span className="review-kind">
      {zh ? "諮詢對話・韓文翻譯" : "상담 대화"}
        </span></div>
      {preview && <Link className="review-read-link" href={`${localPath(locale, "/reviews")}#story-${story.id}`}>{zh ? "閱讀完整對話" : "대화 전체 읽기"}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
    </div>
  </article>;
}

export function FeaturedReviews({ locale = "ko" }: { locale?: Locale }) {
  const zh = locale === "zh-TW";
  const stories = getReviewStories(locale);
  return <section id="reviews" className="reviews-featured" aria-labelledby="reviews-heading" lang={zh ? "zh-Hant-TW" : "ko"}>
    <div className="shell">
      <div className="reviews-section-heading" data-reveal>
        <div><h2 id="reviews-heading">{zh ? <>面對選擇時，<br />一起聊聊心裡的事。</> : <>선택 앞에서,<br />함께 나누는 이야기.</>}</h2></div>
      </div>
      <div className="reviews-grid">{getFeaturedReviews(locale).map(story => <ReviewCard preview key={story.id} story={story} locale={locale} />)}</div>
    </div>
  </section>;
}

export function ReviewsCollection({ locale = "ko" }: { locale?: Locale }) {
  const [category, setCategory] = useState<ReviewCategory>("all");
  const zh = locale === "zh-TW";
  const stories = getReviewStories(locale);
  const visibleStories = stories.filter(story => category === "all" || getReviewCategory(story.id) === category);
  return <main id="main-content" tabIndex={-1} className="reviews-page shell" lang={zh ? "zh-Hant-TW" : "ko"}>
    <Link href={`${homePath(locale)}#reviews`} className="reviews-back">{zh ? "返回首頁" : "메인으로 돌아가기"}</Link>
    <header className="reviews-page-heading">
      <p className="review-eyebrow">DEAR KKACHI / OUR CONVERSATIONS</p>
      <h1>{zh ? <>你的煩惱，<br /><em>喜鵲的回信。</em></> : <>당신의 고민,<br /><em>까치의 답장.</em></>}</h1>
    </header>
    <div className="reviews-filters" role="group" aria-label={zh ? "依領域篩選" : "상담 분야별 필터"}>
      {reviewCategories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} aria-controls="reviews-results" onClick={() => setCategory(item.id)}>
        {item[locale]}<span>{item.id === "all" ? stories.length : stories.filter(story => getReviewCategory(story.id) === item.id).length}</span>
      </button>)}
    </div>
    <div className="reviews-collection-label"><h2>{reviewCategories.find(item => item.id === category)?.[locale]} {zh ? "故事" : "이야기"}</h2><span role="status" aria-live="polite">{visibleStories.length}{zh ? " 篇" : "편"}</span></div>
    <div key={category} id="reviews-results" className="reviews-grid reviews-collection">{visibleStories.map(story => <ReviewCard key={story.id} story={story} locale={locale} />)}</div>
    <div className="reviews-closing"><BrandMascot portrait size={64} /><p>{zh ? "你的故事，也可以慢慢說給我聽。" : "당신의 이야기도, 천천히 들려주세요."}</p><Link className="primary-button" href={`${homePath(locale)}#consultation`}>{zh ? "了解喜鵲老師的諮詢方式" : "까치 선생님 상담 안내"}</Link></div>
  </main>;
}
