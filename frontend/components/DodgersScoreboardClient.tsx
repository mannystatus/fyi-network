"use client";

// Owns the actual rendering + live polling for DodgersScoreboard.tsx (the
// server component that fetches the initial data + JSON-LD, then hands off
// to this). A live score doesn't move on its own between page loads — the
// server component is only re-rendered on navigation — so this polls
// /api/dodgers-games every 30s and re-renders in place. Only bothers
// polling at all if there was something to show on first render; an empty
// initial fetch (offseason) has nothing worth refreshing.
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatGameTime, type DodgersGame } from "../lib/dodgers";

const UPCOMING_LIMIT = 3;
const POLL_MS = 30_000;

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

export default function DodgersScoreboardClient({
  initialGames,
  showScheduleLink = true,
}: {
  initialGames: DodgersGame[];
  showScheduleLink?: boolean;
}) {
  const [games, setGames] = useState(initialGames);

  useEffect(() => {
    if (initialGames.length === 0) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/dodgers-games");
        if (res.ok) setGames(await res.json());
      } catch {
        // Network hiccup — just try again on the next interval.
      }
    }, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (games.length === 0) return null;

  const live = games.find((g) => g.status === "live");
  const upcoming = games.filter((g) => g.status === "preview").slice(0, UPCOMING_LIMIT);
  const disclaimer = upcoming.find((g) => g.odds?.disclaimer)?.odds?.disclaimer;

  return (
    <div className="dodgers-scoreboard">
      <p className="section-label">{live ? "Live now" : "Today's Games & Upcoming Games"}</p>
      {live && <GameRow game={live} />}
      {upcoming.length > 0 && (
        <div className="dodgers-scoreboard-upcoming">
          {live && upcoming.length > 0 && <p className="section-label">Next up</p>}
          {upcoming.map((g) => (
            <GameRow key={g.gamePk} game={g} />
          ))}
        </div>
      )}
      {disclaimer && (
        <details className="dodgers-odds-disclaimer">
          <summary>Gambling disclosure</summary>
          <p>{disclaimer}</p>
        </details>
      )}
      {showScheduleLink && (
        <Link href="/schedule" className="dodgers-schedule-link">
          Full schedule →
        </Link>
      )}
    </div>
  );
}
