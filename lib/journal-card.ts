import type { Article } from "./knowledge";
import { readingMinutes } from "./journal-art";

export type JournalCardData = Pick<Article, "slug" | "title" | "excerpt" | "category" | "date" | "image"> & { minutes: number };
export function toJournalCard(a: Article & { body?: string }): JournalCardData {
  return {
    slug: a.slug, title: a.title, excerpt: a.excerpt, category: a.category,
    date: a.date, image: a.image,
    minutes: readingMinutes(a.body ?? a.sections.map((s) => s.title + s.text).join(""), a.locale),
  };
}
