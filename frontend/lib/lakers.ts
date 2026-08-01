// Live scores + upcoming schedule for fyiLakers, from ESPN's public
// scoreboard/schedule API (site.api.espn.com) — free, no API key, no auth.
// Unlike Dodgers' MLB Stats API, this one is genuinely unofficial and
// undocumented (no ESPN developer program covers it), so it's a real step
// down in stability — every field read here is guarded so a shape change
// upstream degrades to "no game data" instead of a broken page (see
// getLakersGames' try/catch), same approach as lib/dodgers.ts.

const LAKERS_TEAM_SLUG = "lal";
const SCHEDULE_DAYS_AHEAD = 3;

export type LakersGame = {
  gameId: string;
  gameDate: string; // ISO
  status: "preview" | "live" | "final";
  opponent: string;
  opponentAbbr: string;
  isHome: boolean;
  venue: string;
  lakersScore: number | null;
  opponentScore: number | null;
  periodState: string | null; // e.g. "Q3 5:42", null unless status is "live"
};

function toStatus(state: string): LakersGame["status"] {
  if (state === "in") return "live";
  if (state === "post") return "final";
  return "preview";
}

export async function getLakersGames(): Promise<LakersGame[]> {
  const now = new Date();
  const cutoff = new Date(now.getTime() + SCHEDULE_DAYS_AHEAD * 24 * 60 * 60 * 1000);

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${LAKERS_TEAM_SLUG}/schedule`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    const games: LakersGame[] = [];
    for (const event of data.events ?? []) {
      const comp = event.competitions?.[0];
      if (!comp) continue;

      const statusType = comp.status?.type;
      const status = toStatus(statusType?.state);

      // Exclude completed games outright. A live game's start timestamp is
      // necessarily in the past by the time it's showing as "in progress",
      // so only preview (not-yet-started) games get the [now, cutoff]
      // window check — a live game always passes regardless of how long
      // ago it tipped off.
      if (status === "final") continue;
      const gameDate = new Date(event.date);
      if (status === "preview" && (gameDate < now || gameDate > cutoff)) continue;

      const lakers = comp.competitors?.find((c: { team?: { abbreviation?: string } }) => c.team?.abbreviation === "LAL");
      const opponent = comp.competitors?.find((c: { team?: { abbreviation?: string } }) => c.team?.abbreviation !== "LAL");
      if (!lakers || !opponent) continue;

      games.push({
        gameId: event.id,
        gameDate: event.date,
        status,
        opponent: opponent.team?.displayName ?? "TBD",
        opponentAbbr: opponent.team?.abbreviation ?? "TBD",
        isHome: lakers.homeAway === "home",
        venue: comp.venue?.fullName ?? "",
        lakersScore: lakers.score != null ? Number(lakers.score) : null,
        opponentScore: opponent.score != null ? Number(opponent.score) : null,
        periodState:
          status === "live" && comp.status?.period
            ? `Q${comp.status.period} ${comp.status.displayClock ?? ""}`.trim()
            : null,
      });
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

// Single compact line for the titlebar (see template.tsx's .lakers-score) —
// same priority order as Dodgers' getTitlebarText: live score, then next
// scheduled game, then the domain-name fallback (offseason, or the
// upstream API being unreachable/changed shape).
export function getTitlebarText(games: LakersGame[], fallback: string): string {
  const live = games.find((g) => g.status === "live");
  if (live) {
    return `LAL ${live.lakersScore} – ${live.opponentAbbr} ${live.opponentScore} · ${live.periodState}`;
  }
  const next = games.find((g) => g.status === "preview");
  if (next) {
    return `Next: ${next.isHome ? "vs" : "@"} ${next.opponentAbbr} · ${formatGameTimeShort(next.gameDate)}`;
  }
  return fallback;
}
