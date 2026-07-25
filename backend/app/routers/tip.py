import datetime as dt
import hashlib
import hmac
import os
import secrets
import urllib.error
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..auth import _client_ip
from ..database import get_db
from ..models import TipSubmission
from ..schemas import TipChallenge, TipCreate

router = APIRouter(prefix="/api/tip", tags=["tip"])

# The public-facing "Send us a tip" form never talks to Formspree directly —
# everything goes through here first. That keeps the real Formspree URL out
# of the client JS bundle entirely (previously it was inline in the
# component, which meant a bot could skip the site and POST straight to
# Formspree, bypassing any client-side check whatsoever) and lets the
# honeypot/timing/math-challenge/rate-limit checks below actually be
# enforced, rather than just trusted from the client.

MIN_ELAPSED_MS = 2000  # a human reading + typing a real tip takes longer than this
RATE_LIMIT_WINDOW_MINUTES = 60
MAX_SUBMISSIONS_PER_WINDOW = 5


def _sign(a: int, b: int) -> str:
    # Reuses ADMIN_API_KEY purely as an HMAC key — HMAC output doesn't
    # reveal the key, so this doesn't weaken it, and it avoids requiring
    # yet another secret to be configured.
    secret = os.getenv("ADMIN_API_KEY", "")
    return hmac.new(secret.encode(), f"{a}:{b}".encode(), hashlib.sha256).hexdigest()[:16]


@router.get("/challenge", response_model=TipChallenge)
def get_challenge():
    """Our own tiny CAPTCHA: a fresh arithmetic question, signed so the
    answer can be verified server-side without any session/DB state."""
    a = secrets.randbelow(8) + 2  # 2-9
    b = secrets.randbelow(8) + 2  # 2-9
    return TipChallenge(a=a, b=b, sig=_sign(a, b))


@router.post("")
def submit_tip(payload: TipCreate, request: Request, db: Session = Depends(get_db)):
    # Bots tend to fill in every field, including ones a real visitor never
    # sees. Pretend success so a bot doesn't learn it was caught and adapt.
    if payload.honeypot:
        return {"status": "ok"}

    if payload.elapsed_ms < MIN_ELAPSED_MS:
        raise HTTPException(status_code=400, detail="Too fast — try again.")

    if not secrets.compare_digest(payload.sig, _sign(payload.a, payload.b)):
        raise HTTPException(status_code=400, detail="That check question expired — reopen the form and retry.")

    if payload.answer != payload.a + payload.b:
        raise HTTPException(status_code=400, detail="That's not the right answer to the check question.")

    endpoint = os.getenv("FORMSPREE_ENDPOINT")
    if not endpoint:
        raise HTTPException(status_code=503, detail="Tip form is not configured on the server")

    ip = _client_ip(request)
    cutoff = dt.datetime.utcnow() - dt.timedelta(minutes=RATE_LIMIT_WINDOW_MINUTES)

    # Opportunistic cleanup of expired rows — same self-cleaning pattern as
    # AdminAuthFailure, no separate cron job needed.
    db.query(TipSubmission).filter(TipSubmission.occurred_at < cutoff).delete()

    recent = (
        db.query(TipSubmission)
        .filter(TipSubmission.ip == ip, TipSubmission.occurred_at >= cutoff)
        .count()
    )
    if recent >= MAX_SUBMISSIONS_PER_WINDOW:
        db.commit()
        raise HTTPException(
            status_code=429,
            detail="Too many tips submitted recently from this IP — try again later.",
            headers={"Retry-After": str(RATE_LIMIT_WINDOW_MINUTES * 60)},
        )

    form_data = urllib.parse.urlencode(
        {
            "message": payload.message,
            "email": payload.email or "",
            "_subject": f"Tip for {payload.source}",
            "source": payload.source,
        }
    ).encode()
    req = urllib.request.Request(
        endpoint,
        data=form_data,
        # Formspree sits behind Cloudflare, which blocks the default
        # Python-urllib/x.y User-Agent outright (Cloudflare error 1010) —
        # a browser-like one is required for the request to reach Formspree
        # at all, independent of anything Formspree itself checks.
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (compatible; fyi-network-tip-relay/1.0)",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            ok = 200 <= resp.status < 300
    except urllib.error.HTTPError:
        ok = False
    except urllib.error.URLError:
        raise HTTPException(status_code=502, detail="Couldn't reach the tip inbox — try again shortly.")

    if not ok:
        raise HTTPException(status_code=502, detail="The tip inbox rejected the submission.")

    db.add(TipSubmission(ip=ip))
    db.commit()
    return {"status": "ok"}
