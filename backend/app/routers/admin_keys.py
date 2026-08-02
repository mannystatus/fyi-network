import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..auth import AdminScope, _client_ip, geolocate_ip, hash_key, require_admin, require_superadmin, verify_turnstile
from ..database import get_db
from ..models import AdminAccessLog, AdminKey
from ..schemas import AdminAccessLogOut, AdminKeyCreate, AdminKeyCreateResult, AdminKeyOut, AdminScopeOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/whoami", response_model=AdminScopeOut, dependencies=[Depends(verify_turnstile)])
def whoami(request: Request, scope: AdminScope = Depends(require_admin), db: Session = Depends(get_db)):
    """
    Lets a caller (superadmin or a scoped contributor key) discover its own
    access — the frontend uses this to decide what to render in /admin
    before showing anything else (see admin/page.tsx). Doubles as the
    access-log hook: every successful call here is one /admin load, so it's
    also where we record who (which key), where (geolocated IP), and when —
    see AdminAccessLog and GET /access-log below.

    verify_turnstile runs first (listed in `dependencies`, ahead of the
    require_admin key check below) — a bot with no way to solve the widget
    never even gets to try a key against require_admin's rate limiter.
    """
    location = geolocate_ip(_client_ip(request))
    db.add(
        AdminAccessLog(
            ip=_client_ip(request),
            city=location["city"],
            region=location["region"],
            country=location["country"],
            is_superadmin=scope.is_superadmin,
            key_label=scope.label,
        )
    )
    db.commit()
    return AdminScopeOut(is_superadmin=scope.is_superadmin, brand_slugs=sorted(scope.brand_slugs), label=scope.label)


@router.get("/access-log", response_model=list[AdminAccessLogOut], dependencies=[Depends(require_superadmin)])
def list_access_log(db: Session = Depends(get_db)):
    """Recent /admin logins, newest first — superadmin only, same gate as key management."""
    return db.query(AdminAccessLog).order_by(AdminAccessLog.occurred_at.desc()).limit(200).all()


@router.get("/keys", response_model=list[AdminKeyOut], dependencies=[Depends(require_superadmin)])
def list_keys(db: Session = Depends(get_db)):
    return db.query(AdminKey).order_by(AdminKey.created_at.desc()).all()


@router.post("/keys", response_model=AdminKeyCreateResult, dependencies=[Depends(require_superadmin)])
def create_key(payload: AdminKeyCreate, db: Session = Depends(get_db)):
    """Shows the raw key exactly once, in this response — only its hash is ever stored."""
    raw_key = secrets.token_urlsafe(32)
    row = AdminKey(
        label=payload.label,
        key_hash=hash_key(raw_key),
        key_prefix=raw_key[:8],
        brand_slugs=",".join(payload.brand_slugs),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return AdminKeyCreateResult(
        id=row.id,
        label=row.label,
        key_prefix=row.key_prefix,
        brand_slugs=payload.brand_slugs,
        is_revoked=row.is_revoked,
        created_at=row.created_at,
        key=raw_key,
    )


@router.post("/keys/{key_id}/revoke", response_model=AdminKeyOut, dependencies=[Depends(require_superadmin)])
def revoke_key(key_id: int, db: Session = Depends(get_db)):
    row = db.query(AdminKey).filter(AdminKey.id == key_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Key not found")
    row.is_revoked = True
    db.commit()
    db.refresh(row)
    return row
