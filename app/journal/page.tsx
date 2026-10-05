import { Journal } from "@/components/journal";
import { articles } from "@/lib/editorial";
import { toJournalCard } from "@/lib/journal-card";
import { journalMetadata, journalSchema, jsonLd } from "@/lib/journal-seo";
export const dynamic = "force-dynamic";
export const metadata = journalMetadata("ko");
export default async function Page() {
  const cards = (await articles("ko")).map(toJournalCard);
  return <><Journal locale="ko" articles={cards} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(journalSchema(cards, "ko")) }} /></>;
}
