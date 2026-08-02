"use client";

// Mirrors components/DodgersScoreboardClient.tsx — see that file for the
// full rationale (polling, mount-once effect, empty-initial-games bail).
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatGameTime, type LakersGame } from "../lib/lakers";

const UPCOMING_LIMIT = 3;
const POLL_MS = 30_000;

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

export default function LakersScoreboardClient({
  initialGames,
  showScheduleLink = true,
}: {
  initialGames: LakersGame[];
  showScheduleLink?: boolean;
}) {
  const [games, setGames] = useState(initialGames);

  useEffect(() => {
    if (initialGames.length === 0) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/lakers-games");
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
    <div className="lakers-scoreboard">
      <p className="section-label">{live ? "Live now" : "Today's Games & Upcoming Games"}</p>
      {live && <GameRow game={live} />}
      {upcoming.length > 0 && (
        <div className="lakers-scoreboard-upcoming">
          {live && upcoming.length > 0 && <p className="section-label">Next up</p>}
          {upcoming.map((g) => (
            <GameRow key={g.gameId} game={g} />
          ))}
        </div>
      )}
      {disclaimer && (
        <details className="lakers-odds-disclaimer">
          <summary>Gambling disclosure</summary>
          <p>{disclaimer}</p>
        </details>
      )}
      {showScheduleLink && (
        <Link href="/schedule" className="lakers-schedule-link">
          Full schedule →
        </Link>
      )}
    </div>
  );
}
