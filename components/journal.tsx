"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { SiteHeader, SiteFooter } from "./site";
import { JournalCard } from "./journal-card";
import type { JournalCardData } from "@/lib/journal-card";
import type { Locale } from "@/lib/brand";

export function Journal({ locale, articles }: { locale: Locale; articles: JournalCardData[] }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const zh = locale === "zh-TW";
  const categories = [...new Set(articles.map((a) => a.category))];
  const search = query.trim().toLocaleLowerCase();
  const visible = articles.filter((a) => (filter === "all" || a.category === filter) &&
    `${a.title} ${a.excerpt} ${a.category}`.toLocaleLowerCase().includes(search));
  return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="shell journal-library">
    <div className="page-heading journal-heading">
      <p className="tiny-label muted">NOTES FROM DON SSAEM</p>
      <h1 className="serif">{zh ? "和 Don 老師一起，慢慢讀懂自己。" : "돈쌤과 읽는, 나를 위한 사주 노트."}</h1>
      <p>{zh ? "從八字與五行，到關係、工作和人生的節奏。\n讓 Don 老師陪你，把古老的語言讀成今天的故事。" : "사주와 오행에서 관계, 일, 삶의 흐름까지.\n낯선 말들을 오늘의 이야기로 풀어 전합니다."}</p>
      <span className="journal-intro-note">{zh ? "給初學者，也給想重新認識自己的你。" : "처음 읽는 분에게도, 다시 나를 살피는 분에게도."}</span>
    </div>
    <div className="journal-tools">
      <p className="tiny-label muted">{zh ? "尋找今天想讀的筆記" : "오늘 궁금한 이야기를 찾아보세요"}</p>
      <label className="journal-search"><Search size={18} aria-hidden="true" /><span className="sr-only">{zh ? "搜尋專欄" : "콘텐츠 검색"}</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={zh ? "搜尋五行、關係、大運…" : "오행, 관계, 대운 검색…"} />
      </label>
    </div>
    <div className="journal-filters" role="group" aria-label={zh ? "依主題篩選" : "주제별로 보기"}>
      <button onClick={() => setFilter("all")} aria-pressed={filter === "all"} className={`filter-button ${filter === "all" ? "active" : ""}`}>{zh ? "全部" : "전체"}<span>{articles.length}</span></button>
      {categories.map((category) => <button key={category} onClick={() => setFilter(category)} aria-pressed={filter === category} className={`filter-button ${filter === category ? "active" : ""}`}>{category}<span>{articles.filter((a) => a.category === category).length}</span></button>)}
    </div>
    <p className="journal-result-count" role="status">{zh ? `共 ${visible.length} 篇筆記` : `${visible.length}편의 노트`}</p>
    <div className="journal-grid">{visible.map((a, i) => <JournalCard key={a.slug} article={a} locale={locale} priority={i === 0} />)}</div>
    {visible.length === 0 && <div className="journal-empty"><p>{zh ? "暫時沒有找到這個主題，換個關鍵字試試。" : "아직 찾는 노트가 없어요. 다른 단어로 찾아보세요."}</p><button className="text-link" onClick={() => { setFilter("all"); setQuery(""); }}><X size={15} />{zh ? "清除篩選" : "검색 초기화"}</button></div>}
  </main><SiteFooter locale={locale} /></>;
}
