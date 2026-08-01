import { NextResponse } from "next/server";
import { getLakersGames } from "../../../lib/lakers";

// See app/api/dodgers-games/route.ts — same reasoning, mirrored for Lakers.
export async function GET() {
  const games = await getLakersGames();
  return NextResponse.json(games);
}
