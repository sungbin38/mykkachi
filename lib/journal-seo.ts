import type { Metadata } from "next";
import { ORIGIN, homePath, localPath, type Locale } from "./brand";
import type { Article } from "./knowledge";
import type { JournalCardData } from "./journal-card";
import { journalArtwork } from "./journal-art";

export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
export const articleUrl = (slug: string, locale: Locale) => ORIGIN + localPath(locale, `/journal/${slug}`);
export function languageAlternates(path: string) {
  return { "ko-KR": path, "zh-TW": `/zh-TW${path}`, "x-default": path };
}
export function journalMetadata(locale: Locale): Metadata {
  const zh = locale === "zh-TW";
  const title = zh ? "八字與五行專欄：讀懂自己、關係與生活" : "돈쌤의 사주 노트: 사주·오행·관계·일상 가이드";
  const description = zh ? "從四柱八字、十神、五行平衡，到感情、工作與大運。閱讀 DON SSAEM 的繁體中文八字入門與生活專欄，慢慢認識自己的步調。" : "사주팔자 입문부터 십성, 오행의 균형, 관계와 직업, 대운까지. 돈쌤의 사주 노트와 함께 나를 이해하는 사주 콘텐츠를 읽어보세요.";
  const image = journalArtwork("four-pillars", locale);
  const url = ORIGIN + localPath(locale, "/journal");
  return {
    title, description, alternates: { canonical: url, languages: languageAlternates("/journal") },
    openGraph: { title, description, url, type: "website", siteName: "DON SSAEM", locale: zh ? "zh_TW" : "ko_KR", images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] },
    twitter: { card: "summary_large_image", title, description, images: [image.src] },
  };
}
export function journalSchema(articles: JournalCardData[], locale: Locale) {
  return {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: locale === "ko" ? "돈쌤의 사주 노트" : "Don 老師的八字筆記",
    url: ORIGIN + localPath(locale, "/journal"), inLanguage: locale === "ko" ? "ko-KR" : "zh-Hant-TW",
    mainEntity: { "@type": "ItemList", numberOfItems: articles.length, itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: articleUrl(a.slug, locale), name: a.title, image: ORIGIN + a.image.src })) },
  };
}
export function articleSchema(a: Article) {
  const zh = a.locale === "zh-TW";
  const url = articleUrl(a.slug, a.locale);
  const brandUrl = ORIGIN + homePath(a.locale);
  return [
    {
      "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${url}#article`,
      headline: a.title, description: a.excerpt, url, mainEntityOfPage: { "@type": "WebPage", "@id": url },
      inLanguage: zh ? "zh-Hant-TW" : "ko-KR", articleSection: a.category,
      datePublished: "2026-10-05", dateModified: a.date,
      image: { "@type": "ImageObject", url: ORIGIN + a.image.src, width: a.image.width, height: a.image.height, caption: a.image.alt },
      author: { "@type": "Organization", name: zh ? "DON SSAEM 編輯" : "돈쌤 편집부", url: brandUrl },
      publisher: { "@type": "Organization", name: "DON SSAEM", url: brandUrl },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: zh ? "首頁" : "홈", item: brandUrl },
        { "@type": "ListItem", position: 2, name: zh ? "日常專欄" : "돈쌤의 사주 노트", item: ORIGIN + localPath(a.locale, "/journal") },
        { "@type": "ListItem", position: 3, name: a.title, item: url },
      ],
    },
  ];
}
