import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import AdminScope, hash_key, require_admin, require_superadmin
from ..database import get_db
from ..models import AdminKey
from ..schemas import AdminKeyCreate, AdminKeyCreateResult, AdminKeyOut, AdminScopeOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/whoami", response_model=AdminScopeOut)
def whoami(scope: AdminScope = Depends(require_admin)):
    """
    Lets a caller (superadmin or a scoped contributor key) discover its own
    access — the frontend uses this to decide what to render in /admin
    before showing anything else (see admin/page.tsx).
    """
    return AdminScopeOut(is_superadmin=scope.is_superadmin, brand_slugs=sorted(scope.brand_slugs), label=scope.label)


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
