// Live scores + upcoming schedule for fyiDodgers, from MLB's public Stats
// API (statsapi.mlb.com) — free, no API key, no auth. It's the same data
// MLB.com itself runs on, but it's not an officially documented/supported
// public API, so treat it as best-effort: every field read here is guarded
// so a shape change upstream degrades to "no game data" instead of a
// broken page (see getDodgersGames' try/catch).

const DODGERS_TEAM_ID = 119;
const SCHEDULE_DAYS_AHEAD = 3;

export type DodgersGame = {
  gamePk: number;
  gameDate: string; // ISO
  status: "preview" | "live" | "final";
  detailedState: string;
  opponent: string;
  opponentAbbr: string;
  isHome: boolean;
  venue: string;
  dodgersRuns: number | null;
  opponentRuns: number | null;
  inningState: string | null; // e.g. "Top 8th", null unless status is "live"
};

function toStatus(abstractGameState: string): DodgersGame["status"] {
  if (abstractGameState === "Live") return "live";
  if (abstractGameState === "Final") return "final";
  return "preview";
}

export async function getDodgersGames(): Promise<DodgersGame[]> {
  const start = new Date();
  const end = new Date(start.getTime() + SCHEDULE_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  try {
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${DODGERS_TEAM_ID}` +
        `&startDate=${fmt(start)}&endDate=${fmt(end)}&hydrate=linescore,team`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    const games: DodgersGame[] = [];
    for (const date of data.dates ?? []) {
      for (const g of date.games ?? []) {
        const isHome = g.teams?.home?.team?.id === DODGERS_TEAM_ID;
        const dodgersTeam = isHome ? g.teams?.home : g.teams?.away;
        const opponentTeam = isHome ? g.teams?.away : g.teams?.home;
        const status = toStatus(g.status?.abstractGameState);
        const ls = g.linescore;

        games.push({
          gamePk: g.gamePk,
          gameDate: g.gameDate,
          status,
          detailedState: g.status?.detailedState ?? "Scheduled",
          opponent: opponentTeam?.team?.name ?? "TBD",
          opponentAbbr: opponentTeam?.team?.abbreviation ?? "TBD",
          isHome,
          venue: g.venue?.name ?? "",
          dodgersRuns: ls?.teams?.[isHome ? "home" : "away"]?.runs ?? null,
          opponentRuns: ls?.teams?.[isHome ? "away" : "home"]?.runs ?? null,
          inningState:
            status === "live" && ls?.inningState && ls?.currentInningOrdinal
              ? `${ls.inningState} ${ls.currentInningOrdinal}`
              : null,
        });
      }
    }
    return games.sort((a, b) => a.gameDate.localeCompare(b.gameDate));
  } catch {
    return [];
  }
}

export function formatGameTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatGameTimeShort(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Single compact line for the titlebar (see template.tsx's .dodgers-score) —
// live score takes priority over the next scheduled game, which takes
// priority over the domain-name fallback used when the schedule fetch
// comes back empty (offseason, or the upstream API being unreachable).
export function getTitlebarText(games: DodgersGame[], fallback: string): string {
  const live = games.find((g) => g.status === "live");
  if (live) {
    return `LAD ${live.dodgersRuns} – ${live.opponentAbbr} ${live.opponentRuns} · ${live.inningState}`;
  }
  const next = games.find((g) => g.status === "preview");
  if (next) {
    return `Next: ${next.isHome ? "vs" : "@"} ${next.opponentAbbr} · ${formatGameTimeShort(next.gameDate)}`;
  }
  return fallback;
}
