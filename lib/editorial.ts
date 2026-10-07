import {
  allArticles,
  articleBody,
  getArticle,
  type Article,
} from "./knowledge";
import { publicContent } from "./server";
import type { Locale } from "./brand";
import { cache } from "react";
export type Editorial = Article & { body: string };
// Keep saved editorial snapshots intact while presenting the current brand.
const currentBrandCopy = (text: string) => text
  .replaceAll("마이까치는", "돈쌤은")
  .replaceAll("마이까치로", "돈쌤으로")
  .replaceAll("마이까치", "돈쌤")
  .replaceAll("MY KKACHI", "DON SSAEM")
  .replaceAll("루운은", "돈쌤은")
  .replaceAll("루운으로", "돈쌤으로")
  .replaceAll("루운", "돈쌤")
  .replaceAll("LUUN", "DON SSAEM");
export const articles = cache(async (locale: Locale): Promise<Editorial[]> => {
  const base = allArticles(locale).map((a) => ({ ...a, body: articleBody(a) }));
  try {
    const published = await publicContent(locale);
    for (const p of published) {
      const i = base.findIndex((a) => a.slug === p.slug);
      const a = getArticle(p.topic, locale);
      if (a) {
        const entry = {
          ...a,
          slug: p.slug,
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
      e instanceof Error ? e.name : "Unknown",
    );
  }
  return base;
});
export async function article(slug: string, locale: Locale) {
  return (await articles(locale)).find((a) => a.slug === slug);
}
