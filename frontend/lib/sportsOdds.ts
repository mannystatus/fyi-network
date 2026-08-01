// Shared by lib/dodgers.ts and lib/lakers.ts — betting odds for a specific
// team's game, from the same ESPN site API family already used for
// Lakers' schedule (site.api.espn.com). Odds only live on the *date-based*
// scoreboard endpoint, not the team-schedule endpoint both files otherwise
// use, so this is a separate fetch keyed by date + team abbreviation.
//
// Deliberately informational only — the displayed value, spread, and
// over/under, no embedded "bet now" links to the sportsbook. Whoever
// renders a GameOdds should show the responsible-gambling note ESPN
// supplies (see disclaimer below) alongside it.

export type GameOdds = {
  provider: string; // e.g. "DraftKings"
  details: string; // e.g. "LAD -156"
  spread: number | null;
  overUnder: number | null;
  disclaimer: string | null;
};

export async function fetchOddsForTeamOnDate(
  sportPath: string, // e.g. "baseball/mlb" or "basketball/nba"
  dateStr: string, // YYYYMMDD, UTC
  teamAbbr: string
): Promise<GameOdds | null> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${dateStr}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    for (const event of data.events ?? []) {
      const comp = event.competitions?.[0];
      const hasTeam = comp?.competitors?.some(
        (c: { team?: { abbreviation?: string } }) => c.team?.abbreviation === teamAbbr
      );
      const odds = comp?.odds?.[0];
      if (hasTeam && odds) {
        return {
          provider: odds.provider?.name ?? "",
          details: odds.details ?? "",
          spread: odds.spread ?? null,
          overUnder: odds.overUnder ?? null,
          disclaimer: odds.footer?.disclaimer ?? null,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// One scoreboard fetch per unique date rather than per game — cheap
// insurance against a multi-game day (doubleheader) hitting the endpoint
// twice for the same date. Known limitation: a doubleheader's two games
// share whatever single odds entry ESPN returns for that date, since
// matching is by date+team, not by exact event id.
export async function attachOddsToPreviewGames<T extends { status: string; gameDate: string }>(
  games: T[],
  sportPath: string,
  teamAbbr: string
): Promise<Map<string, GameOdds | null>> {
  const dates = [
    ...new Set(
      games.filter((g) => g.status === "preview").map((g) => g.gameDate.slice(0, 10).replace(/-/g, ""))
    ),
  ];
  const entries = await Promise.all(
    dates.map(async (d) => [d, await fetchOddsForTeamOnDate(sportPath, d, teamAbbr)] as const)
  );
  return new Map(entries);
}
