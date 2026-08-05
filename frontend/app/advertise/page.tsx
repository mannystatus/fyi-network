import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentBrand, getAllBrands } from "../../lib/api";
import { canonicalDomain, canonicalOrigin } from "../../lib/url";
import { EXTERNAL_SITES } from "../../lib/externalSites";
import AdvertiseForm from "../../components/AdvertiseForm";

export const metadata: Metadata = {
  title: "Advertise With Us",
  alternates: { canonical: "/advertise" },
};

export default async function AdvertisePage() {
  const [brand, brands] = await Promise.all([getCurrentBrand(), getAllBrands()]);

  return (
    <article>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>

      <div className="article-header">
        <p className="advertise-eyebrow">Partner With Us</p>
        <h1 className="article-title">Get your brand in front of readers who are already paying attention</h1>
        <p className="article-dek advertise-lead">
          The fyi network reaches readers across {brands.length + EXTERNAL_SITES.length} sites — daily tech and
          entertainment news, sports coverage, and deal-hunting. Sponsor a single site or the whole network, with
          no ad platform to configure.
        </p>
        <a href="#advertise-form" className="advertise-cta">
          See how it works &darr;
        </a>
      </div>

      <div className="advertise-sites-card">
        <p className="advertise-sites-title">Our sites</p>
        <ul className="advertise-sites-list">
          {brands.map((b) => (
            <li key={b.slug}>
              <a href={canonicalOrigin(b.domain)} className="advertise-site-chip">
                <span className="advertise-site-dot" style={{ background: b.accent_color }} />
                {b.name} · {canonicalDomain(b.domain)}
              </a>
            </li>
          ))}
          {EXTERNAL_SITES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="advertise-site-chip">
                <span className="advertise-site-dot" style={{ background: "var(--comment)" }} />
                {s.name} · {s.url.replace(/^https?:\/\//, "")}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <section className="advertise-steps">
        <div className="advertise-step">
          <span className="advertise-step-num">1</span>
          <h3>Tell us about it</h3>
          <p>A brand, product, or storefront you want in front of readers — fill out the form below.</p>
        </div>
        <div className="advertise-step">
          <span className="advertise-step-num">2</span>
          <h3>We match it to a site</h3>
          <p>Tech, entertainment, sports, travel, deals — it runs where its audience is already reading.</p>
        </div>
        <div className="advertise-step">
          <span className="advertise-step-num">3</span>
          <h3>It goes live</h3>
          <p>Clearly marked as sponsored, on the site (or sites) that make sense for your audience.</p>
        </div>
      </section>

      <section className="advertise-partners">
        <div className="advertise-partner-card">
          <h3>Sponsored article</h3>
          <p>A dedicated write-up about your brand or product, published alongside our regular coverage.</p>
        </div>
        <div className="advertise-partner-card">
          <h3>Display placement</h3>
          <p>Featured placement in the header, in-feed, or in-article ad slots on one or more sites.</p>
        </div>
        <div className="advertise-partner-card">
          <h3>Cross-network reach</h3>
          <p>Run across several sites in the family at once for broader reach across different audiences.</p>
        </div>
        <div className="advertise-partner-card">
          <h3>Something else</h3>
          <p>Affiliate partnership, co-marketing, or a custom arrangement — tell us what you have in mind.</p>
        </div>
      </section>
      <p className="advertise-note">
        Rates depend on site, placement, and duration — tell us what you're looking for and we'll follow up with
        options.
      </p>

      <div id="advertise-form" className="advertise-card">
        <h2>Get in touch</h2>
        <p className="advertise-card-sub">Brands, retailers, and partners — reach out below.</p>
        <AdvertiseForm brandName={brand.name} />
      </div>
    </article>
  );
}
