from fastapi import Header, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import get_db
from .models import Brand

# Local dev domain aliases -> real domains, so you can test with
# fyimac.localhost:3000 etc. without editing /etc/hosts for every brand.
DEV_DOMAIN_ALIASES = {
    "fyimac.localhost": "fyimac.com",
    "fyiwin.localhost": "fyiwin.com",
    "fyigoogle.localhost": "fyigoogle.com",
}


def resolve_brand(
    db: Session = Depends(get_db),
    x_brand_slug: str | None = Header(default=None, alias="X-Brand-Slug"),
    host: str | None = Header(default=None, alias="X-Forwarded-Host"),
    brand: str | None = Query(default=None, description="Explicit brand slug override, e.g. ?brand=fyimac"),
) -> Brand:
    """
    Resolution order:
      1. explicit ?brand=slug query param (handy for testing/curl)
      2. X-Brand-Slug header (set by the Next.js middleware from the hostname)
      3. X-Forwarded-Host header, matched against each brand's domain
    This lets ONE backend deployment serve all three domains — the caller
    just needs to tell it, via header or param, which brand it's asking for.
    """
    candidate_slug = brand or x_brand_slug

    query = db.query(Brand)

    if candidate_slug:
        found = query.filter(Brand.slug == candidate_slug.lower()).first()
        if found:
            return found

    if host:
        host = host.split(":")[0].lower()
        host = DEV_DOMAIN_ALIASES.get(host, host)
        found = query.filter(Brand.domain == host).first()
        if found:
            return found

    raise HTTPException(
        status_code=400,
        detail="Could not resolve brand — pass ?brand=<slug>, X-Brand-Slug, or a recognized Host.",
    )
