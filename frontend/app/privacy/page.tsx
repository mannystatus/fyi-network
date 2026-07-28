import Link from "next/link";
import { getCurrentBrand } from "../../lib/api";
import LatestFromUs from "../../components/LatestFromUs";

export default async function PrivacyPage() {
  const brand = await getCurrentBrand();

  return (
    <article>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>

      <div className="article-header">
        <h1 className="article-title">Privacy Policy</h1>
        <p className="article-dek">
          Template legal content for {brand.name} — see the notice below before relying on it.
        </p>
      </div>

      <div className="legal-body">
        <p>
          <strong>This is placeholder legal content, not legal advice.</strong> It describes this site's actual
          technical behavior as of this writing, but it hasn't been reviewed by an attorney and doesn't cover
          jurisdiction-specific obligations (GDPR, CCPA, etc.). Have it reviewed before relying on it for a
          real, public-facing product.
        </p>

        <h2>1. Cookies</h2>
        <p>
          {brand.name} does not require an account, and does not collect names, emails, or other personal
          information to read articles. The site sets a small number of first-party cookies purely to make the
          site work correctly:
        </p>
        <ul>
          <li>
            <strong>brand-slug</strong> — remembers which of the network's sites you're on, so the UI themes
            correctly.
          </li>
          <li>
            <strong>theme</strong> — remembers your light/dark mode preference.
          </li>
        </ul>
        <p>
          Neither cookie is used for advertising, tracking across other sites, or identifying you personally.
          Separately, <strong>Google</strong>, as this site&apos;s ad-serving vendor, sets its own third-party
          cookies to serve and measure ads — see the Google AdSense Disclosure below.
        </p>

        <h2>2. Google AdSense Disclosure</h2>
        <p>
          This site is a Google AdSense publisher: ads shown throughout the site are served by Google. As a
          third-party vendor, Google uses cookies (including the DoubleClick cookie) to serve ads based on your
          prior visits to this and other websites. Google's use of advertising cookies enables it and its
          partners to serve ads to you based on your visit to this site and/or other sites on the internet.
        </p>
        <p>
          You can see or opt out of personalized advertising served by Google at{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          , or opt out of participating vendors&apos; personalized ads generally at{" "}
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </p>

        <h2>3. Third-Party Services</h2>
        <p>
          Beyond the first-party cookies above, this site relies on the following third-party services to
          operate, each governed by its own provider's privacy policy:
        </p>
        <ul>
          <li>
            <strong>Google</strong> — serves as this site&apos;s ad-serving vendor via Google AdSense (see the
            disclosure above), and may also be used for site analytics and tag management.
          </li>
        </ul>

        <h2>4. Browser notifications</h2>
        <p>
          If you choose to enable notifications, your browser handles that permission entirely on its own —
          {" " + brand.name} never sees a device token, email, or any identifying information about you as a
          result. Notifications are generated locally in your browser by checking for new articles while a tab
          is open; nothing is sent to a push service or stored about you server-side.
        </p>

        <h2>5. Third-party links</h2>
        <p>
          Articles link out to third-party news publishers. Once you leave this site, that publisher's own
          privacy policy applies, not this one.
        </p>

        <h2>6. Server logs</h2>
        <p>
          Like most web servers, ours may log basic technical request data (IP address, user agent, requested
          path) for operational purposes such as debugging and abuse prevention. These logs are ours alone —
          they're not shared with or used to build Google's advertising profiles, which are governed by the
          Google AdSense Disclosure above instead.
        </p>

        <h2>7. Children's privacy</h2>
        <p>This site is not directed at children under 13 and does not knowingly collect data from them.</p>

        <h2>8. Changes</h2>
        <p>This policy may be updated at any time; continued use of the site constitutes acceptance of changes.</p>

        <p>
          See the <Link href="/terms">Terms of Use</Link> for the rest of the legal terms governing this site.
        </p>
      </div>

      <LatestFromUs />
    </article>
  );
}
