"""
Run with: python -m app.send_game_alerts

Checks fyiDodgers' and fyiLakers' upcoming/live games against the same
public sports APIs the frontend uses (MLB Stats API for Dodgers, ESPN's
schedule endpoint for Lakers — see frontend/lib/dodgers.ts and
frontend/lib/lakers.ts, which this intentionally mirrors in Python since
there's no code-sharing between the FastAPI backend and the Next.js
frontend) and sends two kinds of Web Push alert to that brand's
subscribers:

  - "starting_soon": a game kicks off within the next hour
  - "final":         a game just ended, with the final score

Meant to run on a schedule (~every 15 min, see
.github/workflows/game-alerts.yml) — SentGameAlert dedupes so each game
only ever triggers one of each alert type regardless of how many times
this runs while the condition holds. Skips a brand's fetch entirely if it
has zero subscribers, so an ordinary run costs nothing beyond the two
schedule fetches once real subscribers exist.
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone

import httpx
from pywebpush import webpush, WebPushException

from .database import Base, SessionLocal, engine, ensure_schema
from .models import PushSubscription, SentGameAlert

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_CLAIM_EMAIL = os.getenv("VAPID_CLAIM_EMAIL", "tech@fyi-network.com")

STARTING_SOON_WINDOW_MIN = 60
UA = "Mozilla/5.0 (compatible; fyi-network-game-alerts/1.0)"


def _fetch_dodgers_games() -> list[dict]:
    """Mirrors frontend/lib/dodgers.ts's getDodgersGames, trimmed to just
    what alerting needs: id, start time, status, opponent, final score."""
    today = datetime.now(timezone.utc)
    end = today + timedelta(days=1)  # only need "starting soon" + "just ended", not the full 3-day schedule
    fmt = lambda d: d.strftime("%Y-%m-%d")
    url = (
        "https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119"
        f"&startDate={fmt(today)}&endDate={fmt(end)}&hydrate=linescore,team"
    )
    try:
        resp = httpx.get(url, headers={"User-Agent": UA}, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPError:
        return []

    games = []
    for date in data.get("dates", []):
        for g in date.get("games", []):
            is_home = (g.get("teams", {}).get("home", {}).get("team", {}) or {}).get("id") == 119
            opponent_team = g["teams"]["away"] if is_home else g["teams"]["home"]
            state = g.get("status", {}).get("abstractGameState")
            ls = g.get("linescore", {})
            games.append(
                {
                    "game_id": str(g["gamePk"]),
                    "start": g["gameDate"],
                    "status": {"Live": "live", "Final": "final"}.get(state, "preview"),
                    "opponent": opponent_team.get("team", {}).get("name", "their opponent"),
                    "team_runs": (ls.get("teams", {}).get("home" if is_home else "away", {}) or {}).get("runs"),
                    "opp_runs": (ls.get("teams", {}).get("away" if is_home else "home", {}) or {}).get("runs"),
                }
            )
    return games


def _fetch_lakers_games() -> list[dict]:
    """Mirrors frontend/lib/lakers.ts's getLakersGames, trimmed the same way."""
    url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/lal/schedule"
    try:
        resp = httpx.get(url, headers={"User-Agent": UA}, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPError:
        return []

    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=1)
    games = []
    for event in data.get("events", []):
        comp = (event.get("competitions") or [{}])[0]
        state = (comp.get("status", {}).get("type", {}) or {}).get("state")
        status = {"in": "live", "post": "final"}.get(state, "preview")
        if status == "final":
            continue  # a final Lakers game older than "recently" isn't useful to re-check every run
        start = datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
        if start > cutoff and status == "preview":
            continue

        lakers = next((c for c in comp.get("competitors", []) if c.get("team", {}).get("abbreviation") == "LAL"), None)
        opponent = next((c for c in comp.get("competitors", []) if c.get("team", {}).get("abbreviation") != "LAL"), None)
        if not lakers or not opponent:
            continue

        games.append(
            {
                "game_id": event["id"],
                "start": event["date"],
                "status": status,
                "opponent": opponent.get("team", {}).get("displayName", "their opponent"),
                "team_runs": lakers.get("score"),
                "opp_runs": opponent.get("score"),
            }
        )
    return games


BRAND_FETCHERS = {
    "fyidodgers": ("Dodgers", _fetch_dodgers_games),
    "fyilakers": ("Lakers", _fetch_lakers_games),
}


def _send_to_brand_subscribers(db, brand_slug: str, title: str, body: str, url: str) -> None:
    subs = db.query(PushSubscription).filter(PushSubscription.brand_slug == brand_slug).all()
    icon = f"https://www.{brand_slug}.com/icons/{brand_slug}-512.png"
    payload = json.dumps({"title": title, "body": body, "url": url, "icon": icon})
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{VAPID_CLAIM_EMAIL}"},
            )
        except WebPushException as e:
            status = e.response.status_code if e.response is not None else None
            if status in (404, 410):
                db.delete(sub)
            else:
                print(f"  push failed for {sub.endpoint[:60]}...: {e}", file=sys.stderr)


def _already_sent(db, brand_slug: str, game_id: str, alert_type: str) -> bool:
    return (
        db.query(SentGameAlert)
        .filter(
            SentGameAlert.brand_slug == brand_slug,
            SentGameAlert.game_id == game_id,
            SentGameAlert.alert_type == alert_type,
        )
        .first()
        is not None
    )


def main() -> int:
    if not (VAPID_PRIVATE_KEY and VAPID_PUBLIC_KEY):
        print("VAPID keys not configured — nothing to do.", file=sys.stderr)
        return 0

    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    sent_count = 0
    try:
        for brand_slug, (team_name, fetch_games) in BRAND_FETCHERS.items():
            has_subs = db.query(PushSubscription).filter(PushSubscription.brand_slug == brand_slug).first()
            if not has_subs:
                continue

            for game in fetch_games():
                start = datetime.fromisoformat(game["start"].replace("Z", "+00:00"))

                if (
                    game["status"] == "preview"
                    and now < start <= now + timedelta(minutes=STARTING_SOON_WINDOW_MIN)
                    and not _already_sent(db, brand_slug, game["game_id"], "starting_soon")
                ):
                    _send_to_brand_subscribers(
                        db,
                        brand_slug,
                        f"{team_name} game starting soon",
                        f"{team_name} vs {game['opponent']} starts at "
                        f"{start.strftime('%-I:%M %p UTC')}.",
                        f"https://www.{brand_slug}.com/",
                    )
                    db.add(SentGameAlert(brand_slug=brand_slug, game_id=game["game_id"], alert_type="starting_soon"))
                    db.commit()
                    sent_count += 1

                if (
                    game["status"] == "final"
                    and game["team_runs"] is not None
                    and not _already_sent(db, brand_slug, game["game_id"], "final")
                ):
                    won = (game["team_runs"] or 0) >= (game["opp_runs"] or 0)
                    _send_to_brand_subscribers(
                        db,
                        brand_slug,
                        f"Final: {team_name} {'win' if won else 'lose'}",
                        f"{team_name} {game['team_runs']} – {game['opponent']} {game['opp_runs']}",
                        f"https://www.{brand_slug}.com/",
                    )
                    db.add(SentGameAlert(brand_slug=brand_slug, game_id=game["game_id"], alert_type="final"))
                    db.commit()
                    sent_count += 1

        db.commit()
        print(f"Done — {sent_count} alert(s) sent.")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
