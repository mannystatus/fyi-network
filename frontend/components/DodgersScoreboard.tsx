// fyiDodgers homepage widget — live score (if a game's in progress right
// now) plus the next few games in the schedule window fetched by
// getDodgersGames (today through +3 days, see lib/dodgers.ts). Renders
// nothing if the schedule fetch came back empty, rather than showing an
// empty "Schedule" section (offseason, or the upstream API being down).
import { getDodgersGames, formatGameTime, type DodgersGame } from "../lib/dodgers";
import { buildSportsEventJsonLd } from "../lib/sportsJsonLd";

const UPCOMING_LIMIT = 3;
const DODGERS_NAME = "Los Angeles Dodgers";

function GameRow({ game }: { game: DodgersGame }) {
  if (game.status === "live") {
    return (
      <div className="dodgers-game-row dodgers-game-row--live">
        <span className="dodgers-live-dot" />
        <span className="dodgers-game-matchup">
          LAD {game.dodgersRuns} – {game.opponentAbbr} {game.opponentRuns}
        </span>
        <span className="dodgers-game-meta">{game.inningState}</span>
      </div>
    );
  }
  return (
    <div className="dodgers-game-row-wrap">
      <div className="dodgers-game-row">
        <span className="dodgers-game-matchup">
          {game.isHome ? "vs" : "@"} {game.opponent}
        </span>
        <span className="dodgers-game-meta">{formatGameTime(game.gameDate)}</span>
      </div>
      {game.odds && (
        <div className="dodgers-game-odds">
          {game.odds.details}
          {game.odds.overUnder != null && ` · O/U ${game.odds.overUnder}`}
        </div>
      )}
    </div>
  );
}

export default async function DodgersScoreboard() {
  const games = await getDodgersGames();
  if (games.length === 0) return null;

  const live = games.find((g) => g.status === "live");
  const upcoming = games.filter((g) => g.status === "preview").slice(0, UPCOMING_LIMIT);
  const disclaimer = upcoming.find((g) => g.odds?.disclaimer)?.odds?.disclaimer;

  return (
    <div className="dodgers-scoreboard">
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
      <p className="section-label">{live ? "Live now" : "Upcoming games"}</p>
      {live && <GameRow game={live} />}
      {upcoming.length > 0 && (
        <div className="dodgers-scoreboard-upcoming">
          {live && upcoming.length > 0 && <p className="section-label">Next up</p>}
          {upcoming.map((g) => (
            <GameRow key={g.gamePk} game={g} />
          ))}
        </div>
      )}
      {disclaimer && <p className="dodgers-odds-disclaimer">{disclaimer}</p>}
    </div>
  );
}
