import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { localPath, type Locale } from "@/lib/brand";
import type { JournalCardData } from "@/lib/journal-card";

export function JournalCard({ article, locale, priority = false, sizes = "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px" }: { article: JournalCardData; locale: Locale; priority?: boolean; sizes?: string }) {
  const zh = locale === "zh-TW";
  return (
    <a className="journal-card illustrated-letter" href={localPath(locale, `/journal/${article.slug}`)}>
      <div className="journal-cover illustrated-cover">
        <Image src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height}
          sizes={sizes} preload={priority} />
      </div>
      <div className="letter-copy">
        <span className="letter-category">{article.category}</span>
        <div className="journal-meta"><time dateTime={article.date}>{article.date.replaceAll("-", ".")}</time><span>{article.minutes}{zh ? " 分鐘閱讀" : "분 읽기"}</span></div>
        <h3>{article.title}</h3><p>{article.excerpt}</p>
        <span className="letter-read">{zh ? "讀這封信" : "이 편지 읽기"}<ArrowUpRight size={16} aria-hidden="true" /></span>
      </div>
    </a>
  );
}
