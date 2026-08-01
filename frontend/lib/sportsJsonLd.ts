// Shared by DodgersScoreboard.tsx and LakersScoreboard.tsx — schema.org
// SportsEvent structured data for each upcoming game, so Google can surface
// "next Dodgers/Lakers game" directly in search results without a click.
// Mirrors the JSON-LD pattern already used for articles (see
// app/[slug]/page.tsx's NewsArticle/FAQPage jsonLd objects + the
// <script type="application/ld+json"> render).
//
// Deliberately preview-games only, not live/final — a live score changing
// every few minutes isn't something you want baked into structured data
// that search engines may cache for a while.

export type SportsEventInput = {
  startDate: string; // ISO
  venue: string;
  homeTeamName: string;
  awayTeamName: string;
  url: string;
};

export function buildSportsEventJsonLd(game: SportsEventInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${game.awayTeamName} at ${game.homeTeamName}`,
    startDate: game.startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    // Venue name only — no structured street address available from
    // either upstream API without an extra per-venue lookup, and away
    // games rotate through dozens of different venues. Google accepts a
    // bare-name Place; a full address would improve rich-result
    // eligibility but isn't required for validity.
    location: game.venue ? { "@type": "Place", name: game.venue } : undefined,
    homeTeam: { "@type": "SportsTeam", name: game.homeTeamName },
    awayTeam: { "@type": "SportsTeam", name: game.awayTeamName },
    url: game.url,
  };
}
