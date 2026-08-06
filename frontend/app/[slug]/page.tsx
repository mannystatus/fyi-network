import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ApiError, getArticle, getArticles, getCurrentBrand } from "../../lib/api";
import { categoryColor } from "../../lib/colors";
import ShareButtons from "../../components/ShareButtons";
import ArticleList from "../../components/ArticleList";
import LatestFromUs from "../../components/LatestFromUs";
import AdSlot from "../../components/AdSlot";
import FlyNowCrossPromo from "../../components/FlyNowCrossPromo";
import GoogleCrossPromo from "../../components/GoogleCrossPromo";
import NetflixCrossPromo from "../../components/NetflixCrossPromo";
import LakersCrossPromo from "../../components/LakersCrossPromo";
import DodgersCrossPromo from "../../components/DodgersCrossPromo";
import CamsArticleSidebar from "../../components/CamsArticleSidebar";
import { CAMS_REVIEWS } from "../../lib/camsReviews";
import { AD_SLOTS } from "../../lib/analytics";
import { extractFaq } from "../../lib/faq";
import { extractFirstImageUrl } from "../../lib/ogImage";
import { canonicalDomain, canonicalOrigin } from "../../lib/url";

// Each brand cross-promotes exactly one sibling: fyiMac and fyiNetflix
// both drive traffic to fyiFlyNow, while fyiWin -> fyiGoogle -> fyiNetflix
// forms a discovery chain through the rest, ending at fyiFlyNow -> fyiLakers
// -> fyiDodgers (the newest site). fyiDodgers itself promotes no one (it's
// already the thing being promoted).
const CROSS_PROMO: Record<string, React.ComponentType> = {
  fyimac: FlyNowCrossPromo,
  fyiwin: GoogleCrossPromo,
  fyigoogle: NetflixCrossPromo,
  fyinetflix: FlyNowCrossPromo,
  fyiflynow: LakersCrossPromo,
  fyilakers: DodgersCrossPromo,
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
  const url = `${canonicalOrigin(brand.domain)}/${slug}`;
  // Prefer the article's own header image (set from /admin), then an image
  // embedded in the body (e.g. a custom banner pasted into markdown), then
  // fall back to the brand's generic share-preview image. Every article
  // gets one of the three, so link unfurls (iMessage, WhatsApp, SMS, Slack,
  // etc.) always have something to render.
  const imageUrl =
    article.image_url ||
    extractFirstImageUrl(article.body_md, canonicalDomain(brand.domain)) ||
    `${canonicalOrigin(brand.domain)}/og/${brand.slug}.png`;

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

  // Only fyiCams, and only when this article's slug has a matching
  // hand-authored review (see lib/camsReviews.ts) — most articles won't.
  const camsReview = brand.icon === "cams" ? CAMS_REVIEWS[slug] : undefined;

  const url = `${canonicalOrigin(brand.domain)}/${slug}`;
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
      logo: { "@type": "ImageObject", url: `${canonicalOrigin(brand.domain)}/icons/${brand.slug}-512.png` },
    },
    image: [
      article.image_url ||
        extractFirstImageUrl(article.body_md, canonicalDomain(brand.domain)) ||
        `${canonicalOrigin(brand.domain)}/og/${brand.slug}.png`,
    ],
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

      {(() => {
        // Hand-authored fyi content (is_featured) credits the brand itself
        // here, same swap ArticleList already does for its cards —
        // otherwise this would show the admin key's own label instead of
        // the actual outlet. Aggregated RSS briefs keep crediting their
        // real source (article.author).
        const source = article.is_featured ? brand.name : article.author;
        const mainContent = (
          <>
            <div className="article-header">
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.image_url} alt="" className="article-banner" />
              )}
              {article.is_featured && <span className="featured-badge featured-badge-lg">★ Featured</span>}
              <div className="article-header-tags">
                <span className="fyi-badge fyi-badge-lg">fyi network{source ? ` · ${source}` : ""}</span>
                {article.category && (
                  <span className="category" style={{ color: categoryColor(article.category) }}>
                    {article.category}
                  </span>
                )}
              </div>
              <h1 className="article-title">{article.title}</h1>
              {article.dek && <p className="article-dek">{article.dek}</p>}
              <div className="article-meta">
                {source}
                {source && " · "}
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body_md}</ReactMarkdown>
            </div>

            <AdSlot slot={AD_SLOTS.inArticle} />

            {(() => {
              const CrossPromo = CROSS_PROMO[brand.slug];
              return CrossPromo ? <CrossPromo /> : null;
            })()}
          </>
        );

        return camsReview ? (
          <div className="cams-article-grid">
            <div>{mainContent}</div>
            <CamsArticleSidebar review={camsReview} />
          </div>
        ) : (
          mainContent
        );
      })()}

      {related.length > 0 && (
        <div className="related-section">
          <p className="section-label">More in {article.category}</p>
          <ArticleList articles={related} brandName={brand.name} brandSlug={brand.slug} emptyMessage="" />
        </div>
      )}

      <LatestFromUs excludeSlug={slug} />
    </article>
  );
}
