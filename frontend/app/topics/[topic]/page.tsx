import Link from "next/link";
import { getArticles } from "../../../lib/api";
import ArticleList from "../../../components/ArticleList";

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
