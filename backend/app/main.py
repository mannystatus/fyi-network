from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, ensure_schema
from .routers import brands, articles

Base.metadata.create_all(bind=engine)
ensure_schema(engine)

app = FastAPI(title="fyi network API")

# In production, restrict this to your three real domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fyimac.com",
        "https://fyiwin.com",
        "https://fyigoogle.com",
        "https://fyinetflix.com",
        "http://fyimac.localhost:3000",
        "http://fyiwin.localhost:3000",
        "http://fyigoogle.localhost:3000",
        "http://fyinetflix.localhost:3000",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brands.router)
app.include_router(articles.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
