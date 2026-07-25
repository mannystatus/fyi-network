import datetime as dt
import os
import secrets

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from .database import get_db
from .models import AdminAuthFailure

FAILURE_WINDOW_MINUTES = 15
MAX_FAILURES_PER_WINDOW = 10


def _client_ip(request: Request) -> str:
    # Vercel's edge sets this; the leftmost entry is the original client,
    # each proxy hop appends its own after it.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def require_admin(
    request: Request,
    db: Session = Depends(get_db),
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
) -> None:
    """
    Gate for write endpoints (POST/DELETE /api/articles). Single shared-secret
    header, checked against ADMIN_API_KEY — no user accounts on this project,
    so this is deliberately as simple as the rest of the stack.
    Fails closed: if the server has no key configured, writes are refused
    rather than silently left open.

    Rate-limited by IP (not just gated by the key) so a script hammering
    this endpoint — with or without the right key — gets throttled rather
    than able to hit it at full speed indefinitely. This also covers callers
    hitting the API directly, not just the /admin form, since the check
    lives here rather than client-side.
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

    if not x_admin_key or not secrets.compare_digest(x_admin_key, expected):
        db.add(AdminAuthFailure(ip=ip))
        db.commit()
        raise HTTPException(status_code=401, detail="Missing or invalid X-Admin-Key")

    db.commit()  # persist the cleanup delete even when auth succeeds
