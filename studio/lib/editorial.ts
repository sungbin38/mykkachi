import {
  allArticles,
  articleBody,
  getArticle,
  type Article,
} from "./knowledge";
import { publicContent } from "./server";
import type { Locale } from "./brand";
export type Editorial = Article & { body: string };
// Keep saved editorial snapshots intact while presenting the current brand.
const currentBrandCopy = (text: string) => text
  .replaceAll("루운은", "마이까치는")
  .replaceAll("루운으로", "마이까치로")
  .replaceAll("루운", "마이까치")
  .replaceAll("LUUN", "MY KKACHI");
export async function articles(locale: Locale): Promise<Editorial[]> {
  const base = allArticles(locale).map((a) => ({ ...a, body: articleBody(a) }));
  try {
    const published = await publicContent(locale);
    for (const p of published) {
      const i = base.findIndex((a) => a.slug === p.slug);
      const a = getArticle(p.topic, locale);
      if (a) {
        const entry = {
          ...a,
          title: currentBrandCopy(p.title),
          excerpt: currentBrandCopy(p.excerpt),
          body: currentBrandCopy(p.body),
          date: p.updatedAt.slice(0, 10),
        };
        if (i >= 0) base[i] = entry;
        else base.push(entry);
      }
    }
  } catch (e) {
    console.error(
      "Published journal unavailable; serving editorial library",
      e instanceof Error ? e.message : "Unknown",
    );
  }
  return base;
}
export async function article(slug: string, locale: Locale) {
  return (await articles(locale)).find((a) => a.slug === slug);
}
