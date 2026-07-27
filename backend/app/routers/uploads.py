import os
import uuid

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..auth import require_admin

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
BLOB_API_URL = "https://blob.vercel-storage.com"


@router.post("", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    """
    Admin-gated image upload, backing the header-image fields on /admin
    (brand banner + article header image). Proxies straight to Vercel Blob's
    REST API rather than adding a second, frontend-side secret — same
    fail-closed pattern as require_admin's ADMIN_API_KEY check.
    """
    token = os.getenv("BLOB_READ_WRITE_TOKEN")
    if not token:
        raise HTTPException(status_code=503, detail="BLOB_READ_WRITE_TOKEN is not configured on the server")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are accepted")

    body = await file.read()
    if len(body) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image too large — 5MB max")

    ext = os.path.splitext(file.filename or "")[1] or ""
    pathname = f"uploads/{uuid.uuid4().hex}{ext}"

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{BLOB_API_URL}/{pathname}",
            content=body,
            headers={
                "authorization": f"Bearer {token}",
                "x-api-version": "7",
                "x-content-type": file.content_type,
            },
        )

    if resp.status_code >= 300:
        raise HTTPException(status_code=502, detail=f"Upload to storage failed ({resp.status_code})")

    data = resp.json()
    return {"url": data["url"]}
