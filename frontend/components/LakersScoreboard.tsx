// fyiLakers homepage widget — mirrors components/DodgersScoreboard.tsx.
// Live score (if a game's in progress) plus the next few games in the
// schedule window fetched by getLakersGames (today through +3 days, see
// lib/lakers.ts). Renders nothing if that comes back empty — offseason,
// or ESPN's unofficial schedule endpoint being unreachable/changed shape.
import { getLakersGames, formatGameTime, type LakersGame } from "../lib/lakers";

const UPCOMING_LIMIT = 3;

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
    <div className="lakers-game-row">
      <span className="lakers-game-matchup">
        {game.isHome ? "vs" : "@"} {game.opponent}
      </span>
      <span className="lakers-game-meta">{formatGameTime(game.gameDate)}</span>
    </div>
  );
}

export default async function LakersScoreboard() {
  const games = await getLakersGames();
  if (games.length === 0) return null;

  const live = games.find((g) => g.status === "live");
  const upcoming = games.filter((g) => g.status === "preview").slice(0, UPCOMING_LIMIT);

  return (
    <div className="lakers-scoreboard">
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
    </div>
  );
}
