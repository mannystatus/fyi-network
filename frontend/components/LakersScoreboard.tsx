// fyiLakers homepage widget — mirrors components/DodgersScoreboard.tsx.
// Live score (if a game's in progress) plus the next few games in the
// schedule window fetched by getLakersGames (today through +3 days, see
// lib/lakers.ts). Renders nothing if that comes back empty — offseason,
// or ESPN's unofficial schedule endpoint being unreachable/changed shape.
import { getLakersGames, formatGameTime, type LakersGame } from "../lib/lakers";
import { buildSportsEventJsonLd } from "../lib/sportsJsonLd";

const UPCOMING_LIMIT = 3;
const LAKERS_NAME = "Los Angeles Lakers";

function GameRow({ game }: { game: LakersGame }) {
  if (game.status === "live") {
    return (
      <div className="lakers-game-row lakers-game-row--live">
        <span className="lakers-live-dot" />
        <span className="lakers-game-matchup">
          LAL {game.lakersScore} – {game.opponentAbbr} {game.opponentScore}
        </span>
        <span className="lakers-game-meta">{game.periodState}</span>
      </div>
    );
  }
  return (
    <div className="lakers-game-row-wrap">
      <div className="lakers-game-row">
        <span className="lakers-game-matchup">
          {game.isHome ? "vs" : "@"} {game.opponent}
        </span>
        <span className="lakers-game-meta">{formatGameTime(game.gameDate)}</span>
      </div>
      {game.odds && (
        <div className="lakers-game-odds">
          {game.odds.details}
          {game.odds.overUnder != null && ` · O/U ${game.odds.overUnder}`}
        </div>
      )}
    </div>
  );
}

export default async function LakersScoreboard() {
  const games = await getLakersGames();
  if (games.length === 0) return null;

  const live = games.find((g) => g.status === "live");
  const upcoming = games.filter((g) => g.status === "preview").slice(0, UPCOMING_LIMIT);
  const disclaimer = upcoming.find((g) => g.odds?.disclaimer)?.odds?.disclaimer;

  return (
    <div className="lakers-scoreboard">
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
      <p className="section-label">{live ? "Live now" : "Upcoming games"}</p>
      {live && <GameRow game={live} />}
      {upcoming.length > 0 && (
        <div className="lakers-scoreboard-upcoming">
          {live && upcoming.length > 0 && <p className="section-label">Next up</p>}
          {upcoming.map((g) => (
            <GameRow key={g.gameId} game={g} />
          ))}
        </div>
      )}
      {disclaimer && <p className="lakers-odds-disclaimer">{disclaimer}</p>}
    </div>
  );
}
