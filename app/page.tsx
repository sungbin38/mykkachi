import { getArticle } from "@/lib/knowledge";
import { toJournalCard } from "@/lib/journal-card";
import { HomePage } from "@/components/site";
export default function Page() {
  return <HomePage locale="ko" featuredArticles={["five-elements-balance", "day-branch", "luck-cycles"].map((slug) => toJournalCard(getArticle(slug, "ko")!))} />;
}
