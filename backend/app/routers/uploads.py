import io
import os
import uuid

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image, ImageOps

from ..auth import require_admin

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
BLOB_API_URL = "https://blob.vercel-storage.com"

# Article/brand banners render at up to 700px on the page (see .brand-banner
# in globals.css) and get reused as the 1200x630 OG/twitter share image —
# 1600px wide covers both at retina sharpness without shipping multi-MB
# originals (straight-from-phone photos, raw screenshots) into link-preview
# generators. Re-encoding to JPEG also sidesteps formats like AVIF that
# render fine in a browser but silently fail to unfurl in iMessage/SMS/RCS
# link previews (confirmed by hand: an AVIF-uploaded article image showed no
# image at all when shared).
MAX_DIMENSION = 1600
JPEG_QUALITY = 85


def _to_jpeg(raw: bytes) -> bytes:
    image = Image.open(io.BytesIO(raw))
    image = ImageOps.exif_transpose(image)  # phone photos store rotation in EXIF, not the pixel data

    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        # JPEG has no alpha channel — flatten transparency onto white rather
        # than a bare .convert("RGB"), which leaves transparent pixels black.
        rgba = image.convert("RGBA")
        flattened = Image.new("RGB", rgba.size, (255, 255, 255))
        flattened.paste(rgba, mask=rgba.split()[-1])
        image = flattened
    else:
        image = image.convert("RGB")

    if image.width > MAX_DIMENSION or image.height > MAX_DIMENSION:
        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buffer.getvalue()


@router.post("", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    """
    Admin-gated image upload, backing the header-image fields on /admin
    (brand banner + article header image). Re-encodes to a capped-size JPEG
    before proxying to Vercel Blob's REST API rather than adding a second,
    frontend-side secret — same fail-closed pattern as require_admin's
    ADMIN_API_KEY check.
    """
    token = os.getenv("BLOB_READ_WRITE_TOKEN")
    if not token:
        raise HTTPException(status_code=503, detail="BLOB_READ_WRITE_TOKEN is not configured on the server")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are accepted")

    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image too large — 5MB max")

    try:
        body = _to_jpeg(raw)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image file: {exc}") from exc

    pathname = f"uploads/{uuid.uuid4().hex}.jpg"

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{BLOB_API_URL}/{pathname}",
            content=body,
            headers={
                "authorization": f"Bearer {token}",
                "x-api-version": "7",
                "x-content-type": "image/jpeg",
            },
        )

    if resp.status_code >= 300:
        raise HTTPException(status_code=502, detail=f"Upload to storage failed ({resp.status_code})")

    data = resp.json()
    return {"url": data["url"]}
