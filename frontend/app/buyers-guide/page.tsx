import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBrand } from "../../lib/api";
import { daysSince, formatAge, getVerdict } from "../../lib/buyersGuide";
import { BUYERS_GUIDES } from "../../lib/buyersGuideRegistry";
import AdSlot from "../../components/AdSlot";
import { AD_SLOTS } from "../../lib/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  const guide = BUYERS_GUIDES[brand.slug];
  if (!guide) return {};

  return {
    title: `${guide.storeName} Buyers Guide — Should You Buy One Right Now?`,
    description: guide.dek,
    alternates: { canonical: "/buyers-guide" },
  };
}

// Brands without a guide in the registry 404 rather than showing, say,
// Mac shopping advice on fyiWin.
export default async function BuyersGuidePage() {
  const brand = await getCurrentBrand();
  const guide = BUYERS_GUIDES[brand.slug];
  if (!guide) notFound();

  return (
    <article>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>

      <div className="article-header">
        <p className="advertise-eyebrow">Buying Advice</p>
        <h1 className="article-title">{guide.heading}</h1>
        <p className="article-dek advertise-lead">{guide.dek}</p>
      </div>

      <div className="buyers-guide-disclosure">{guide.disclosureNote}</div>

      {guide.categoryOrder.map((category) => {
        const products = guide.products.filter((p) => p.category === category);
        if (products.length === 0) return null;
        return (
          <section key={category} className="buyers-guide-section">
            <p className="section-label buyers-guide-section-title">{category}</p>
            <div className="buyers-guide-grid">
              {products.map((product) => {
                const verdict = getVerdict(product);
                return (
                  <div key={product.id} className="buyers-guide-card">
                    <div className="buyers-guide-card-head">
                      <h3>{product.name}</h3>
                      <span className={`buyers-guide-badge buyers-guide-badge-${verdict.tone}`}>
                        {verdict.label}
                      </span>
                    </div>
                    <p className="buyers-guide-meta">
                      {product.chip} &middot; from {product.fromPrice}
                    </p>
                    <p className="buyers-guide-meta">
                      {product.discontinued
                        ? `Last updated ${formatAge(daysSince(product.releasedOn))}, then discontinued`
                        : `Released ${formatAge(daysSince(product.releasedOn))} · typical refresh every ~${Math.round(
                            product.avgCycleDays / 30.44
                          )} months`}
                    </p>
                    <p className="buyers-guide-note">{product.note}</p>
                    <div className="buyers-guide-cta-row">
                      {product.amazonUrl && (
                        <a
                          href={product.amazonUrl}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="buyers-guide-cta"
                        >
                          Check price on Amazon &rarr;
                        </a>
                      )}
                      <a
                        href={product.storeUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="buyers-guide-cta buyers-guide-cta-secondary"
                      >
                        {product.discontinued ? "Check refurbished stock" : "Buy"} from {guide.storeName} &rarr;
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <AdSlot slot={AD_SLOTS.inArticle} />
    </article>
  );
}
