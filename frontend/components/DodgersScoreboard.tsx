// fyiDodgers homepage widget — server component. Fetches the initial
// schedule (today through +3 days, see lib/dodgers.ts) and emits the
// SportsEvent JSON-LD for upcoming games server-side (structured data
// should reflect what was actually server-rendered, not a client-side
// poll result), then hands the data to DodgersScoreboardClient for the
// actual rendering + live-score polling. Renders nothing if the schedule
// fetch came back empty — offseason, or the upstream API being down.
import { getDodgersGames } from "../lib/dodgers";
import { buildSportsEventJsonLd } from "../lib/sportsJsonLd";
import DodgersScoreboardClient from "./DodgersScoreboardClient";

const DODGERS_NAME = "Los Angeles Dodgers";

export default async function DodgersScoreboard({ showScheduleLink = true }: { showScheduleLink?: boolean }) {
  const games = await getDodgersGames();
  if (games.length === 0) return null;

  const upcoming = games.filter((g) => g.status === "preview").slice(0, 3);

  return (
    <>
      {upcoming.map((g) => (
        <script
          key={`jsonld-${g.gamePk}`}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildSportsEventJsonLd({
                startDate: g.gameDate,
                venue: g.venue,
                homeTeamName: g.isHome ? DODGERS_NAME : g.opponent,
                awayTeamName: g.isHome ? g.opponent : DODGERS_NAME,
                url: "https://www.fyidodgers.com/",
              })
            ),
          }}
        />
      ))}
      <DodgersScoreboardClient initialGames={games} showScheduleLink={showScheduleLink} />
    </>
  );
}
