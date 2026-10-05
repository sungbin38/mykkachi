import { ArticlePage, articleMetadata } from "@/components/article-page";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return articleMetadata((await params).slug, "ko");
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage locale="ko" slug={(await params).slug} />;
}
