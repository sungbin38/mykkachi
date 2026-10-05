import type { MetadataRoute } from "next";
import { FREE_READING_ENABLED, ORIGIN, localPath, type Locale } from "@/lib/brand";
import { articles } from "@/lib/editorial";

// Include the published CMS library as well as the bundled editorial collection.
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales: Locale[] = ["ko", "zh-TW"];
  const collections = await Promise.all(locales.map((locale) => articles(locale)));
  return locales.flatMap((locale, index) => {
    const counterpart = new Set(collections[1 - index].map((a) => a.slug));
    const pages: MetadataRoute.Sitemap = ["", ...(FREE_READING_ENABLED ? ["/read"] : []), "/journal"].map((path) => ({
      url: ORIGIN + (localPath(locale, path) || "/"),
      changeFrequency: "weekly", priority: path ? 0.7 : 1,
      alternates: { languages: { "ko-KR": ORIGIN + (path || "/"), "zh-TW": ORIGIN + "/zh-TW" + path, "x-default": ORIGIN + (path || "/") } },
    }));
    return [...pages, ...collections[index].map((a) => {
      const path = `/journal/${a.slug}`;
      const url = ORIGIN + localPath(locale, path);
      return {
        url, lastModified: a.date, changeFrequency: "monthly" as const, priority: 0.7,
        images: [ORIGIN + a.image.src],
        alternates: { languages: counterpart.has(a.slug)
          ? { "ko-KR": ORIGIN + path, "zh-TW": ORIGIN + "/zh-TW" + path, "x-default": ORIGIN + path }
          : { [locale === "ko" ? "ko-KR" : "zh-TW"]: url } },
      };
    })];
  });
}
