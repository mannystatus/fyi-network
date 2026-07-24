# fyi network — Next.js + FastAPI, one codebase, three domains

One Next.js app and one FastAPI backend serve all of **fyiMac.com**,
**fyiWin.com**, and **fyiGoogle.com**. Nothing is duplicated per brand —
the same deployment just re-themes and re-scopes itself based on which
domain the request came in on.

## How the domain detection works

```
request to fyiwin.com
        │
        ▼
Next.js middleware.ts  ──►  reads the Host header, maps it to a brand slug
                             ("fyiwin.com" -> "fyiwin"), tags the request
                             with an x-brand-slug header + cookie
        │
        ▼
app/layout.tsx (server) ──► calls GET /api/brands/current with that header,
                             gets back { name, accent_color, tagline, ... },
                             and renders the page themed for that brand
        │
        ▼
FastAPI backend         ──► every /api/articles* call is scoped to
                             whichever brand the header/Host resolved to
                             (see app/deps.py: resolve_brand)
```

Nothing about the article data, theming, or routing is hardcoded per
domain — add a fourth brand by inserting one row in the `brands` table
and one entry in `middleware.ts`'s domain map.

## Switching between domains (the UI piece)

`components/DomainSwitcher.tsx` renders every brand from `GET /api/brands`
in a dropdown, and links each one to `https://<that-brand's-domain>/`.
It deliberately sends you to the **other brand's homepage**, not the same
URL path — each brand has its own independent articles, so "the same
slug on another domain" usually wouldn't resolve to anything real. This
keeps the switcher honest instead of producing dead links.

## Running it locally

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m app.seed        # creates fyi.db (SQLite) and seeds the 3 brands
python -m app.ingest_news --all-brands   # populates the feed with real news
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

**Testing all three domains locally** — modern browsers resolve any
`*.localhost` hostname to 127.0.0.1 automatically, no `/etc/hosts` edits
needed. With `npm run dev` running, just visit:
- http://fyimac.localhost:3000
- http://fyiwin.localhost:3000
- http://fyigoogle.localhost:3000

Use the domain switcher in the header to jump between them and confirm
the theme/content actually change.

## Running with Docker (backend + Postgres)

```bash
docker compose up --build
```//
Then run `python -m app.seed` once against that Postgres instance (or add
a one-off seed step to the compose file) to populate the three brands, and
`python -m app.ingest_news --all-brands` to populate the feed.

## Deploying to the real domains

This is the part that's easy to miss: **you do not deploy three separate
frontend projects.** You deploy the Next.js app *once*, then attach all
three domains to that single deployment:

- **Vercel**: one project → Settings → Domains → add `fyimac.com`,
  `fyiwin.com`, `fyigoogle.com`, all pointing at the same deployment.
- **Cloudflare Pages**: same idea — one Pages project, multiple custom
  domains attached.

The middleware reads whichever domain the visitor actually typed, so the
single deployment serves all three correctly. The FastAPI backend
similarly deploys once (Render, Fly.io, a VPS — whatever you used for
hackthedeal) and serves all three brands via the header-based resolution
in `app/deps.py`.

## Project layout

```
backend/
  app/
    models.py       Brand + Article tables (one shared schema, brand_id column)
    deps.py         resolve_brand() — the multi-tenant resolution logic
    routers/        /api/brands, /api/articles — both brand-scoped
    seed.py         populates the 3 brands
    ingest_news.py  populates the feed with real, current news per topic
frontend/
  middleware.ts     Host header -> brand slug, on every request
  lib/api.ts        server-side fetch helper that forwards the brand header
  app/layout.tsx    fetches current brand, applies its accent color
  components/
    DomainSwitcher.tsx   the dropdown that links across all 3 domains
```

## Topics and automatic news ingestion

Each brand has a `topics` column (comma-separated, e.g. fyiMac's
`Mac,iPhone,iPad,Apple Watch,Services`) — the same "single source of
truth" pattern as the rest of `Brand`. The frontend reads it to render
the topic pill nav (`app/layout.tsx`) and the per-topic pages at
`/topics/<topic>` (`app/topics/[topic]/page.tsx`), which just call
`GET /api/articles?category=<topic>`.

`backend/app/ingest_news.py` keeps each brand's feed populated
automatically:

```bash
cd backend && source venv/bin/activate
python -m app.ingest_news --brand fyimac        # one brand
python -m app.ingest_news --all-brands          # every brand
```

For each of a brand's topics, it pulls real, current headlines from
Google News RSS (no API key needed), writes a short attributed "brief"
article per headline (title/author = the real outlet, with a link to
the full story), and skips anything it's already added (deduped by
slug) — so reruns only add what's new. Add a topic to a brand by editing
its `topics` column; ingestion picks it up automatically next run.

`.github/workflows/ingest-news.yml` runs this on a daily cron via GitHub
Actions so the feed keeps updating on its own. It needs a `DATABASE_URL`
repo secret pointing at your deployed Postgres — until that's set, the
workflow just writes into a throwaway SQLite file each run.

## Extending this

- **Markdown rendering**: `body_md` is raw markdown right now — drop in
  `react-markdown` (or `next-mdx-remote`) in `app/[slug]/page.tsx`.
- **Admin/CMS**: there's no write API yet on purpose — the cleanest next
  step is either a small internal admin UI hitting FastAPI directly, or
  swapping `Article` storage for a headless CMS (Payload, Directus) that
  writes into the same Postgres your FastAPI reads from.
- **RSS/sitemaps**: add a `/rss.xml` and `/sitemap.xml` route per brand
  in the frontend, fed by the same `getArticles()` call.
