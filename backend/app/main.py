from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, ensure_schema
from .routers import brands, articles, tip, uploads, admin_keys, push, travel_advisories, visa_requirements

Base.metadata.create_all(bind=engine)
ensure_schema(engine)

app = FastAPI(title="fyi network API")

# Bare domains 301/308-redirect to their www. subdomain (see middleware.ts),
# which is what the browser's Origin header actually carries on a real page
# load — both forms need to be listed, or client-side fetches (this form,
# NewsNotifications' polling) get silently blocked by CORS in production
# despite working fine against *.localhost in dev.
_BRAND_DOMAINS = ["fyimac.com", "fyiwin.com", "fyigoogle.com", "fyinetflix.com", "fyiflynow.com", "fyilakers.com", "fyidodgers.com", "fyicams.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        *(f"https://{d}" for d in _BRAND_DOMAINS),
        *(f"https://www.{d}" for d in _BRAND_DOMAINS),
        *(f"http://{d.split('.')[0]}.localhost:3000" for d in _BRAND_DOMAINS),
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brands.router)
app.include_router(articles.router)
app.include_router(tip.router)
app.include_router(uploads.router)
app.include_router(admin_keys.router)
app.include_router(push.router)
app.include_router(travel_advisories.router)
app.include_router(visa_requirements.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
