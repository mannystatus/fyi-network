import datetime as dt
import hashlib
import ipaddress
import os
import secrets
from dataclasses import dataclass, field

import httpx
from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from .database import get_db
from .models import AdminAuthFailure, AdminKey

FAILURE_WINDOW_MINUTES = 15
MAX_FAILURES_PER_WINDOW = 10


@dataclass
class AdminScope:
    """
    What a validated X-Admin-Key is allowed to do. is_superadmin=True (the
    env-var ADMIN_API_KEY) can touch every brand; a scoped AdminKey row is
    restricted to brand_slugs. Route handlers call check_brand() wherever
    a request names a specific brand (POST/DELETE /api/articles, PATCH
    /api/brands/{slug}) — see routers/articles.py and routers/brands.py.
    """

    is_superadmin: bool
    brand_slugs: set[str] = field(default_factory=set)
    label: str | None = None  # AdminKey.label, for scoped keys — used to default the Author field

    def check_brand(self, slug: str) -> None:
        if self.is_superadmin:
            return
        if slug not in self.brand_slugs:
            raise HTTPException(status_code=403, detail=f"This key isn't scoped to {slug!r}")


def _client_ip(request: Request) -> str:
    # Vercel's edge sets this; the leftmost entry is the original client,
    # each proxy hop appends its own after it.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def hash_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


def geolocate_ip(ip: str) -> dict[str, str | None]:
    """
    Best-effort city/region/country for an IP, used to annotate the admin
    access log (see AdminAccessLog, admin_keys.py's whoami). ip-api.com's
    free tier needs no API key and allows 45 req/min (no daily cap, unlike
    ipapi.co's 1000/day — this endpoint runs on every /admin load, and a
    shared serverless egress IP can burn through a daily cap fast). Any
    failure (rate limit, timeout, private/local IP with nothing to look up)
    just means the log row has no location, not a broken admin page — this
    must never raise.
    """
    empty: dict[str, str | None] = {"city": None, "region": None, "country": None}
    try:
        if ipaddress.ip_address(ip).is_private:
            return empty
    except ValueError:
        return empty  # "unknown" or otherwise unparsable — nothing to look up

    try:
        resp = httpx.get(
            f"http://ip-api.com/json/{ip}", params={"fields": "status,city,regionName,country"}, timeout=3.0
        )
        if resp.status_code != 200:
            return empty
        data = resp.json()
        if data.get("status") != "success":
            return empty
        return {
            "city": data.get("city"),
            "region": data.get("regionName"),
            "country": data.get("country"),
        }
    except Exception:
        return empty


def verify_turnstile(
    request: Request,
    cf_turnstile_response: str | None = Header(default=None, alias="CF-Turnstile-Response"),
) -> None:
    """
    Gate for the /admin key-entry step specifically (GET /api/admin/whoami,
    the check the frontend runs before showing anything else — see
    admin/page.tsx). Separate from require_admin's rate limiter: that caps
    how fast a brute-force script can *try* keys, this stops it from being
    a script at all, since only a real browser can solve the widget and
    obtain a token.

    Deliberately fails OPEN (does nothing) when TURNSTILE_SECRET_KEY isn't
    set, same as GEMINI_API_KEY elsewhere — this is an opt-in hardening
    layer on top of the key check, not a required one, so /admin keeps
    working before it's configured. Once set, a missing/invalid token fails
    closed (401) same as a wrong key.
    """
    secret = os.getenv("TURNSTILE_SECRET_KEY")
    if not secret:
        return

    if not cf_turnstile_response:
        raise HTTPException(status_code=401, detail="Missing Turnstile verification")

    try:
        resp = httpx.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": secret, "response": cf_turnstile_response, "remoteip": _client_ip(request)},
            timeout=5.0,
        )
        ok = resp.status_code == 200 and resp.json().get("success") is True
    except Exception:
        ok = False

    if not ok:
        raise HTTPException(status_code=401, detail="Turnstile verification failed")


def require_admin(
    request: Request,
    db: Session = Depends(get_db),
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
) -> AdminScope:
    """
    Gate for write endpoints (POST/DELETE /api/articles, POST /api/uploads,
    PATCH /api/brands, and everything in routers/admin_keys.py). Resolves
    the header to an AdminScope rather than a bare pass/fail:
      - an exact match on ADMIN_API_KEY (single shared secret, as before)
        is superadmin — full access to every brand plus key management.
      - otherwise, its SHA-256 hash is looked up against AdminKey rows
        (brand-scoped contributor keys issued from /admin) — a match that
        isn't revoked authenticates as that key's scope.
    Fails closed: if the server has no ADMIN_API_KEY configured, writes are
    refused rather than silently left open — that's still required even
    though scoped keys exist, since without it there'd be no way to issue
    or manage them (see require_superadmin).

    Rate-limited by IP (not just gated by the key) so a script hammering
    this endpoint — with or without a right key — gets throttled rather
    than able to hit it at full speed indefinitely. Applies uniformly to
    failed attempts against either kind of key, since it's keyed by IP,
    not by which credential was tried.
    """
    expected = os.getenv("ADMIN_API_KEY")
    if not expected:
        raise HTTPException(status_code=503, detail="ADMIN_API_KEY is not configured on the server")

    ip = _client_ip(request)
    cutoff = dt.datetime.utcnow() - dt.timedelta(minutes=FAILURE_WINDOW_MINUTES)

    # Opportunistic cleanup of expired rows — keeps this table small without
    # a separate cron job, since traffic here is low-volume by nature.
    db.query(AdminAuthFailure).filter(AdminAuthFailure.occurred_at < cutoff).delete()

    recent_failures = (
        db.query(AdminAuthFailure)
        .filter(AdminAuthFailure.ip == ip, AdminAuthFailure.occurred_at >= cutoff)
        .count()
    )
    if recent_failures >= MAX_FAILURES_PER_WINDOW:
        db.commit()
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed admin-key attempts from this IP — try again in {FAILURE_WINDOW_MINUTES} minutes.",
            headers={"Retry-After": str(FAILURE_WINDOW_MINUTES * 60)},
        )

    if x_admin_key and secrets.compare_digest(x_admin_key, expected):
        db.commit()  # persist the cleanup delete even when auth succeeds
        return AdminScope(is_superadmin=True)

    if x_admin_key:
        key_row = (
            db.query(AdminKey)
            .filter(AdminKey.key_hash == hash_key(x_admin_key), AdminKey.is_revoked.is_(False))
            .first()
        )
        if key_row:
            db.commit()
            slugs = {s.strip() for s in key_row.brand_slugs.split(",") if s.strip()}
            return AdminScope(is_superadmin=False, brand_slugs=slugs, label=key_row.label)

    db.add(AdminAuthFailure(ip=ip))
    db.commit()
    raise HTTPException(status_code=401, detail="Missing or invalid X-Admin-Key")


def require_superadmin(scope: AdminScope = Depends(require_admin)) -> AdminScope:
    """
    Gate for key management (routers/admin_keys.py) — a scoped contributor
    key must never be able to create, list, or revoke keys, even ones
    scoped to the same brands it already has. Only ADMIN_API_KEY passes.
    """
    if not scope.is_superadmin:
        raise HTTPException(status_code=403, detail="Superadmin key required")
    return scope
