import Link from "next/link";
import type { Metadata } from "next";
import { getArticles, getCurrentBrand } from "../../../lib/api";
import ArticleList from "../../../components/ArticleList";
import Pagination from "../../../components/Pagination";

const PAGE_SIZE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const topicName = decodeURIComponent(topic);
  const brand = await getCurrentBrand();
  const title = `${topicName} News`;
  const description = `The latest ${topicName} news and coverage from ${brand.name}.`;
  const canonical = `/topics/${encodeURIComponent(topicName)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website" },
    twitter: { title, description },
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { topic } = await params;
  const topicName = decodeURIComponent(topic);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [fetched, brand] = await Promise.all([getArticles(topicName, PAGE_SIZE + 1, offset), getCurrentBrand()]);
  const hasMore = fetched.length > PAGE_SIZE;
  const articles = fetched.slice(0, PAGE_SIZE);

  return (
    <>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link> &nbsp;/&nbsp; {topicName}
      </p>
      <ArticleList
        articles={articles}
        brandName={brand.name}
        emptyMessage={page > 1 ? "Nothing here — go back to page 1." : `No articles yet for ${topicName}.`}
      />
      <Pagination page={page} hasMore={hasMore} basePath={`/topics/${encodeURIComponent(topicName)}`} />
    </>
  );
}
