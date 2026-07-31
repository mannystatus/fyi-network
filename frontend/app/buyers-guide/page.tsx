import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBrand } from "../../lib/api";
import { APPLE_PRODUCTS, CATEGORY_ORDER, daysSince, formatAge, getVerdict } from "../../lib/macBuyersGuide";
import AdSlot from "../../components/AdSlot";
import { AD_SLOTS } from "../../lib/analytics";

export const metadata: Metadata = {
  title: "Apple Buyers Guide — Should You Buy One Right Now?",
  description:
    "Which Macs, iPhones, iPads, Vision Pro, and Apple smart home devices are worth buying today, and which to hold off on, based on how far each model is into Apple's typical refresh cycle.",
  alternates: { canonical: "/buyers-guide" },
};

// fyiMac-only — every other brand 404s here rather than showing Mac
// shopping advice on, say, fyiWin.
export default async function BuyersGuidePage() {
  const brand = await getCurrentBrand();
  if (brand.slug !== "fyimac") notFound();

  return (
    <article>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>

      <div className="article-header">
        <p className="advertise-eyebrow">Buying Advice</p>
        <h1 className="article-title">Should you buy that Apple product right now?</h1>
        <p className="article-dek advertise-lead">
          Apple refreshes every product line on a fairly predictable cycle. Buy right after an update and you get
          the newest hardware for a full cycle; buy right before one and you're stuck with old hardware the moment
          it ships. Below is where every current Mac, iPhone, iPad, Vision Pro, and smart home device sits in its
          cycle, updated automatically as time passes.
        </p>
      </div>

      <div className="buyers-guide-disclosure">
        Disclosure: fyiMac is an Amazon Associate and a Rakuten Advertising affiliate. We may earn a commission on
        qualifying purchases made through the links below, at no extra cost to you. That has no bearing on the buy
        / wait guidance above each product.
      </div>

      {CATEGORY_ORDER.map((category) => {
        const products = APPLE_PRODUCTS.filter((p) => p.category === category);
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
                        href={product.appleUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="buyers-guide-cta buyers-guide-cta-secondary"
                      >
                        {product.discontinued ? "Check refurbished stock" : "Buy"} from Apple &rarr;
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
