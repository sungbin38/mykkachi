import { Journal } from "@/components/journal";
import { articles } from "@/lib/editorial";
import { toJournalCard } from "@/lib/journal-card";
import { journalMetadata, journalSchema, jsonLd } from "@/lib/journal-seo";
export const dynamic = "force-dynamic";
export const metadata = journalMetadata("zh-TW");
export default async function Page() {
  const cards = (await articles("zh-TW")).map(toJournalCard);
  return <><Journal locale="zh-TW" articles={cards} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(journalSchema(cards, "zh-TW")) }} /></>;
}
