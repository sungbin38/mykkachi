import { ArticlePage, articleMetadata } from "@/components/article-page";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return articleMetadata((await params).slug, "zh-TW");
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage locale="zh-TW" slug={(await params).slug} />;
}
