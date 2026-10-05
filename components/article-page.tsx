import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { article, articles } from "@/lib/editorial";
import { FREE_READING_ENABLED, homePath, localPath, type Locale } from "@/lib/brand";
import { toJournalCard } from "@/lib/journal-card";
import { readingMinutes } from "@/lib/journal-art";
import { articleSchema, articleUrl, jsonLd, languageAlternates } from "@/lib/journal-seo";
import { SiteHeader, SiteFooter } from "./site";
import { JournalCard } from "./journal-card";

export async function ArticlePage({ slug, locale }: { slug: string; locale: Locale }) {
  const a = await article(slug, locale);
  if (!a) notFound();
  const zh = locale === "zh-TW";
  const blocks = a.body.split(/\n\s*\n/).filter(Boolean);
  const headings = blocks.map((text, index) => ({ text, index })).filter((b) => b.text.startsWith("## "));
  const others = (await articles(locale)).filter((item) => item.slug !== slug);
  const related = [...others.filter((item) => item.category === a.category), ...others.filter((item) => item.category !== a.category)].slice(0, 3);
  return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="shell">
    <article className="article-body illustrated-article">
      <nav className="article-breadcrumb" aria-label={zh ? "導覽路徑" : "현재 위치"}><a href={homePath(locale)}>{zh ? "首頁" : "홈"}</a><span aria-hidden="true">/</span><a href={localPath(locale, "/journal")}>{zh ? "日常專欄" : "까치의 편지"}</a><span aria-hidden="true">/</span><span>{a.category}</span></nav>
      <header className="article-heading"><p className="tiny-label muted">A LETTER FROM KKACHI · {a.category}</p><h1>{a.title}</h1>
        <p className="article-meta">{zh ? "MY KKACHI 編輯" : "마이까치 편집부"}<span>·</span><time dateTime={a.date}>{a.date}</time><span>·</span>{readingMinutes(a.body, locale)}{zh ? " 分鐘閱讀" : "분 읽기"}</p>
      </header>
      <figure className="article-art"><Image src={a.image.src} alt={a.image.alt} width={a.image.width} height={a.image.height} sizes="(max-width: 800px) 100vw, 800px" preload /><figcaption>{zh ? "小喜鵲陪你，把命理讀成生活。" : "내 곁의 작은 까치와 함께 읽는 사주 이야기."}</figcaption></figure>
      {headings.length > 0 && <nav className="article-toc" aria-label={zh ? "文章目錄" : "이 글의 목차"}><p className="tiny-label">{zh ? "這封信裡" : "이 편지에 담긴 이야기"}</p><ol>{headings.map((b) => <li key={b.index}><a href={`#section-${b.index}`}>{b.text.slice(3)}</a></li>)}</ol></nav>}
      <div className="article-prose">{blocks.map((text, index) => text.startsWith("## ")
        ? <h2 id={`section-${index}`} key={index}>{text.slice(3)}</h2>
        : <p className={index === 0 ? "article-lead" : undefined} key={index}>{text}</p>)}</div>
      <aside className="article-note">{zh ? "本文以傳統命理文化為基礎，提供自我探索的觀點，不保證未來的事件或結果。" : "명리의 전통적 상징을 자기 이해의 관점으로 소개하는 글입니다. 미래의 사건이나 결과를 보장하지 않습니다."}</aside>
      <div className="article-cta"><p className="tiny-label muted">A LITTLE BIRD, BY YOUR SIDE</p><h2>{zh ? "把你的故事，慢慢說給我們聽。" : "이제, 당신의 이야기를 들려주세요."}</h2><p>{zh ? "從讀懂一個名詞，到梳理眼前的選擇。讓對話陪你找到自己的步調。" : "낯선 말 하나를 이해하는 데서, 지금의 선택을 살피는 데까지. 당신의 속도로 함께 이야기해요."}</p><a className="primary-button" href={zh ? "/zh-TW#consultation" : "/book"}>{zh ? "了解一對一諮詢" : "1:1 상담 알아보기"}<ArrowUpRight size={16} /></a>{FREE_READING_ENABLED && <a className="text-link" href={localPath(locale, "/read")}>{zh ? "免費看我的八字" : "내 사주 무료로 보기"}</a>}</div>
      <a className="text-link article-back" href={localPath(locale, "/journal")}><ArrowLeft size={16} />{zh ? "回到全部專欄" : "편지 목록으로 돌아가기"}</a>
    </article>
    <section className="related-letters" aria-labelledby="related-title"><div className="section-heading"><div><p className="tiny-label muted">KEEP READING</p><h2 id="related-title">{zh ? "下一封，也想寄給你。" : "다음 편지도 당신에게."}</h2></div></div><div className="journal-grid">{related.map((item) => <JournalCard key={item.slug} article={toJournalCard(item)} locale={locale} />)}</div></section>
  </main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema(a)) }} /><SiteFooter locale={locale} /></>;
}

export async function articleMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const a = await article(slug, locale);
  if (!a) return { title: locale === "ko" ? "페이지를 찾을 수 없습니다" : "找不到這封信", robots: { index: false } };
  const url = articleUrl(slug, locale);
  return {
    title: a.title, description: a.excerpt,
    alternates: { canonical: url, languages: languageAlternates(`/journal/${slug}`) },
    openGraph: { title: a.title, description: a.excerpt, url, siteName: "MY KKACHI", type: "article", locale: locale === "ko" ? "ko_KR" : "zh_TW", publishedTime: "2026-10-05", modifiedTime: a.date, images: [{ url: a.image.src, width: a.image.width, height: a.image.height, alt: a.image.alt }] },
    twitter: { card: "summary_large_image", title: a.title, description: a.excerpt, images: [a.image.src] },
  };
}
