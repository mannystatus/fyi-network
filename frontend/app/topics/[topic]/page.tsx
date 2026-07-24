import Link from "next/link";
import type { Metadata } from "next";
import { getArticles, getCurrentBrand } from "../../../lib/api";
import ArticleList from "../../../components/ArticleList";

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
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const topicName = decodeURIComponent(topic);
  const articles = await getArticles(topicName);

  return (
    <>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link> &nbsp;/&nbsp; {topicName}
      </p>
      <ArticleList articles={articles} emptyMessage={`No articles yet for ${topicName}.`} />
    </>
  );
}
