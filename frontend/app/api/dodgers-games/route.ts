import { NextResponse } from "next/server";
import { getDodgersGames } from "../../../lib/dodgers";

// Backs the client-side score ticker in DodgersScoreboardClient.tsx — a
// live game's score doesn't update on its own between page loads (the
// scoreboard itself is a server component, revalidated every 60s but only
// re-rendered on navigation), so the client polls this instead of the
// external MLB API directly, reusing the same server-side fetch/cache.
export async function GET() {
  const games = await getDodgersGames();
  return NextResponse.json(games);
}
