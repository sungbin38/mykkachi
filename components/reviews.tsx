"use client";

import Link from "next/link";
import { ChevronLeft, Menu, Phone, Search, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { featuredReviews, reviewStories, type ReviewStory } from "@/lib/reviews";
import { BrandMascot } from "./brand-mascot";
import "./reviews.css";

function Conversation({ story, expanded = false }: { story: ReviewStory; expanded?: boolean }) {
  const messages = expanded ? story.messages : story.messages.filter(message => message.preview);
  return <div className={`review-chat review-chat-${story.theme}${expanded ? " review-chat-expanded" : ""}`} aria-label={`${story.clientName}님과 까치 선생님의 ${story.kind === "actual" ? "실제 상담 대화" : "창작 예시 상담"}`}>
    <div className="review-chat-header">
      <ChevronLeft size={22} aria-hidden="true" />
      <span className="review-avatar" aria-hidden="true">{story.clientName[0]}</span>
      <div className="review-chat-person"><strong>{story.clientName}</strong>{story.kind === "actual" ? <span><UserRound size={12} aria-hidden="true" /> 2</span> : <span className="review-example-label">예시 상담</span>}</div>
      <div className="review-chat-tools" aria-hidden="true"><Search size={18} /><Phone size={18} /><Menu size={21} /></div>
    </div>
    <div className="review-chat-body">
      {messages.map((message, index) => {
        const startsGroup = index === 0 || messages[index - 1].role !== message.role;
        return <div key={index} className={`review-message review-message-${message.role}${startsGroup ? " review-message-first" : ""}`}>
          {startsGroup && <span className="review-sender">{message.role === "client" ? story.clientName : "까치 선생님"}</span>}
          <div className="review-bubble-row"><p className="review-bubble">{message.text}</p>{message.time && <span className="review-message-time">{message.time}</span>}</div>
        </div>;
      })}
    </div>
  </div>;
}

function ReviewCard({ story }: { story: ReviewStory }) {
  return <article className={`review-card review-card-${story.kind}`} id={`story-${story.id}`}>
    <Conversation story={story} />
    <div className="review-card-info">
      <div className="review-card-meta"><span className="review-client-name">{story.clientName}님</span><span className="review-topic">{story.topic}</span></div>
      <h3>{story.title}</h3>
      <div className="review-card-bottom"><span className="review-kind">{story.kind === "actual" ? "실제 상담 대화" : "창작 예시"}</span>
        <Dialog>
          <DialogTrigger className="review-read-button" aria-label={`${story.title} 전체 읽기`}>대화 전체 보기</DialogTrigger>
          <DialogContent className="review-dialog">
            <div className="review-dialog-heading">
              <span className="review-topic">{story.topic}</span>
              <DialogTitle>{story.title}</DialogTitle>
              <DialogDescription>{story.kind === "actual" ? "제공된 실제 상담 대화에서 이름과 회사명을 가리고 발췌했습니다." : "다양한 고민을 소재로 창작한 예시 상담입니다. 실제 고객의 대화나 후기가 아닙니다."}</DialogDescription>
            </div>
            <Conversation story={story} expanded />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </article>;
}

export function FeaturedReviews() {
  return <section id="reviews" className="reviews-featured" aria-labelledby="reviews-heading">
    <div className="shell">
      <div className="reviews-section-heading">
        <div><p className="review-eyebrow">DEAR KKACHI / OUR CONVERSATIONS</p><h2 id="reviews-heading">선택 앞에서,<br />함께 나누는 이야기.</h2></div>
        <div className="reviews-section-intro"><p>이직부터 연애와 결혼까지.<br />고민과 조언, 그 뒤의 마음을 담았어요.</p><Link className="reviews-all-link" href="/reviews">후기 모두 보기 <span>{reviewStories.length}</span></Link></div>
      </div>
      <div className="reviews-grid">{featuredReviews.map(story => <ReviewCard key={story.id} story={story} />)}</div>
    </div>
  </section>;
}

export function ReviewsCollection() {
  return <main className="reviews-page shell">
    <Link href="/#reviews" className="reviews-back">메인으로 돌아가기</Link>
    <header className="reviews-page-heading">
      <p className="review-eyebrow">DEAR KKACHI / OUR CONVERSATIONS</p>
      <h1>당신의 고민,<br /><em>까치의 답장.</em></h1>
      <p>이직과 커리어, 연애와 결혼, 건강과 자녀, 학업까지.<br />민*님의 실제 대화와 다양한 고민을 담은 예시 상담을 만나보세요.</p>
    </header>
    <div className="reviews-collection-label"><h2>전체 이야기</h2><span>{reviewStories.length}편</span></div>
    <div className="reviews-grid reviews-collection">{reviewStories.map(story => <ReviewCard key={story.id} story={story} />)}</div>
    <div className="reviews-closing"><BrandMascot portrait size={64} /><p>당신의 이야기도, 천천히 들려주세요.</p><Link className="primary-button" href="/#consultation">까치 선생님 상담 안내</Link></div>
  </main>;
}
