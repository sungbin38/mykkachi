import type { MetadataRoute } from "next";
import { ORIGIN, localPath, type Locale } from "@/lib/brand";
import { TOPICS } from "@/lib/knowledge";
export default function sitemap(): MetadataRoute.Sitemap {
  return (["ko", "zh-TW"] as Locale[]).flatMap((locale) =>
    ["", "/read", "/journal", ...TOPICS.map((t) => "/journal/" + t)].map(
      (path) => ({
        url: ORIGIN + (localPath(locale, path) || "/"),
        changeFrequency: "weekly" as const,
        priority: path ? 0.7 : 1,
        alternates: {
          languages: {
            "ko-KR": ORIGIN + (path || "/"),
            "zh-TW": ORIGIN + "/zh-TW" + path,
          },
        },
      }),
    ),
  );
}
