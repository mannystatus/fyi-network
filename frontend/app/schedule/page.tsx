import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBrand } from "../../lib/api";
import { canonicalOrigin } from "../../lib/url";
import DodgersScoreboard from "../../components/DodgersScoreboard";
import LakersScoreboard from "../../components/LakersScoreboard";

// Only fyiDodgers/fyiLakers have schedule data (see lib/dodgers.ts,
// lib/lakers.ts) — every other brand 404s. Exists as its own indexable
// route (rather than only living on the homepage, where the scoreboard
// widget already renders) so the SportsEvent JSON-LD it emits has a
// dedicated URL search can actually rank for "dodgers schedule" /
// "lakers schedule" queries, and so it's bookmarkable on its own.
const TEAM_NAME: Record<string, string> = {
  fyidodgers: "Dodgers",
  fyilakers: "Lakers",
};

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  const team = TEAM_NAME[brand.slug];
  if (!team) return {};

  const title = `${team} Schedule & Live Scores | ${brand.name}`;
  const description = `Live scores, upcoming ${team} games, and betting odds for the next few days.`;
  const url = `${canonicalOrigin(brand.domain)}/schedule`;

  return {
    title,
    description,
    alternates: { canonical: "/schedule" },
    openGraph: { title, description, type: "website", url, siteName: brand.name },
    twitter: { card: "summary", title, description },
  };
}

export default async function SchedulePage() {
  const brand = await getCurrentBrand();
  const team = TEAM_NAME[brand.slug];
  if (!team) notFound();

  return (
    <article>
      <div className="article-header">
        <h1 className="article-title">{team} Schedule</h1>
        <p className="article-dek">Live scores, upcoming games, and odds for the next few days.</p>
      </div>

      {brand.slug === "fyidodgers" && <DodgersScoreboard showScheduleLink={false} />}
      {brand.slug === "fyilakers" && <LakersScoreboard showScheduleLink={false} />}
    </article>
  );
}
