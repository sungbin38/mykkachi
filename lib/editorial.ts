import {
  allArticles,
  articleBody,
  getArticle,
  type Article,
} from "./knowledge";
import type { Locale } from "./brand";
export type Editorial = Article & { body: string };
// Public journal content is versioned in Git and published by Vercel.
// The private Sites Studio remains a separate application.
export async function articles(locale: Locale): Promise<Editorial[]> {
  return allArticles(locale).map(a => ({ ...a, body: articleBody(a) }));
}
export async function article(slug: string, locale: Locale) {
  return (await articles(locale)).find((a) => a.slug === slug);
}
