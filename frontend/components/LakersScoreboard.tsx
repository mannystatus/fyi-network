// fyiLakers homepage widget — mirrors components/DodgersScoreboard.tsx.
// Server component: fetches the initial schedule + emits SportsEvent
// JSON-LD, hands off to LakersScoreboardClient for rendering + live-score
// polling. Renders nothing if the schedule fetch came back empty —
// offseason, or ESPN's unofficial schedule endpoint being unreachable.
import { getLakersGames } from "../lib/lakers";
import { buildSportsEventJsonLd } from "../lib/sportsJsonLd";
import LakersScoreboardClient from "./LakersScoreboardClient";

const LAKERS_NAME = "Los Angeles Lakers";

export default async function LakersScoreboard({ showScheduleLink = true }: { showScheduleLink?: boolean }) {
  const games = await getLakersGames();
  if (games.length === 0) return null;

  const upcoming = games.filter((g) => g.status === "preview").slice(0, 3);

  return (
    <>
      {upcoming.map((g) => (
        <script
          key={`jsonld-${g.gameId}`}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildSportsEventJsonLd({
                startDate: g.gameDate,
                venue: g.venue,
                homeTeamName: g.isHome ? LAKERS_NAME : g.opponent,
                awayTeamName: g.isHome ? g.opponent : LAKERS_NAME,
                url: "https://www.fyilakers.com/",
              })
            ),
          }}
        />
      ))}
      <LakersScoreboardClient initialGames={games} showScheduleLink={showScheduleLink} />
    </>
  );
}
