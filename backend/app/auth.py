import os
import secrets

from fastapi import Header, HTTPException


def require_admin(x_admin_key: str | None = Header(default=None, alias="X-Admin-Key")) -> None:
    """
    Gate for write endpoints (e.g. POST /api/articles). Single shared-secret
    header, checked against ADMIN_API_KEY — no user accounts on this project,
    so this is deliberately as simple as the rest of the stack.
    Fails closed: if the server has no key configured, writes are refused
    rather than silently left open.
    """
    expected = os.getenv("ADMIN_API_KEY")
    if not expected:
        raise HTTPException(status_code=503, detail="ADMIN_API_KEY is not configured on the server")
    if not x_admin_key or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(status_code=401, detail="Missing or invalid X-Admin-Key")
