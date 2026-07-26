import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { ApiError, getArticle, getArticles, getCurrentBrand } from "../../lib/api";
import { categoryColor } from "../../lib/colors";
import ShareButtons from "../../components/ShareButtons";
import ArticleList from "../../components/ArticleList";
import AdSlot from "../../components/AdSlot";
import FlyNowCrossPromo from "../../components/FlyNowCrossPromo";
import GoogleCrossPromo from "../../components/GoogleCrossPromo";
import NetflixCrossPromo from "../../components/NetflixCrossPromo";
import { AD_SLOTS } from "../../lib/analytics";
import { extractFaq } from "../../lib/faq";
import { extractFirstImageUrl } from "../../lib/ogImage";

// Each brand cross-promotes exactly one sibling: fyiMac and fyiNetflix
// both drive traffic to fyiFlyNow (the newest site), while fyiWin -> fyiGoogle
// -> fyiNetflix forms a discovery chain through the rest. fyiFlyNow itself
// promotes no one (it's already the thing being promoted).
const CROSS_PROMO: Record<string, React.ComponentType> = {
  fyimac: FlyNowCrossPromo,
  fyiwin: GoogleCrossPromo,
  fyigoogle: NetflixCrossPromo,
  fyinetflix: FlyNowCrossPromo,
};

function readingTime(bodyMd: string): number {
  const words = bodyMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let article;
  try {
    article = await getArticle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return {};
    throw err;
  }

  const brand = await getCurrentBrand();
  const description = article.dek || undefined;
  const url = `https://${brand.domain}/${slug}`;
  // Prefer an image embedded in the article itself (e.g. a custom banner);
  // fall back to the brand's generic share-preview image otherwise. Every
  // article gets one or the other, so link unfurls (iMessage, WhatsApp, SMS,
  // Slack, etc.) always have something to render.
  const imageUrl = extractFirstImageUrl(article.body_md, brand.domain) || `https://${brand.domain}/og/${brand.slug}.png`;

  return {
    title: article.title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url,
      siteName: brand.name,
      publishedTime: article.published_at,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article;
  try {
    article = await getArticle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [related, brand] = await Promise.all([
    article.category ? getArticles(article.category).then((a) => a.filter((x) => x.slug !== slug).slice(0, 4)) : [],
    getCurrentBrand(),
  ]);

  const url = `https://${brand.domain}/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.dek || undefined,
    datePublished: article.published_at,
    author: article.author ? { "@type": "Organization", name: article.author } : undefined,
    publisher: {
      "@type": "Organization",
      name: brand.name,
      logo: { "@type": "ImageObject", url: `https://${brand.domain}/icons/${brand.slug}-512.png` },
    },
    image: [extractFirstImageUrl(article.body_md, brand.domain) || `https://${brand.domain}/og/${brand.slug}.png`],
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  // Mirrors the visible "Frequently Asked Questions" section in body_md, if
  // the article has one — Google requires FAQPage structured data to match
  // what's actually rendered on the page, not just live in the JSON-LD.
  const faqItems = extractFaq(article.body_md);
  const faqJsonLd = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>

      <div className="article-header">
        {article.is_featured && <span className="featured-badge featured-badge-lg">★ Featured</span>}
        {article.category && (
          <span className="category" style={{ color: categoryColor(article.category) }}>
            {article.category}
          </span>
        )}
        <h1 className="article-title">{article.title}</h1>
        {article.dek && <p className="article-dek">{article.dek}</p>}
        <div className="article-meta">
          {article.author}
          {article.author && " · "}
          {new Date(article.published_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          {readingTime(article.body_md)} min read
        </div>
        <ShareButtons title={article.title} />
      </div>

      <div className="article-body">
        <ReactMarkdown>{article.body_md}</ReactMarkdown>
      </div>

      <AdSlot slot={AD_SLOTS.inArticle} />

      {(() => {
        const CrossPromo = CROSS_PROMO[brand.slug];
        return CrossPromo ? <CrossPromo /> : null;
      })()}

      {related.length > 0 && (
        <div className="related-section">
          <p className="section-label">More in {article.category}</p>
          <ArticleList articles={related} emptyMessage="" />
        </div>
      )}
    </article>
  );
}
