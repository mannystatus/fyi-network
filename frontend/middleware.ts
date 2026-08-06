import { NextRequest, NextResponse } from "next/server";

// Single source of truth for domain -> brand slug mapping at the edge.
// (The backend's /api/brands is the source of truth for brand *content* —
// this map only needs to exist so the middleware can tag the request
// before any data fetching happens.)
const DOMAIN_TO_SLUG: Record<string, string> = {
  "fyimac.com": "fyimac",
  "www.fyimac.com": "fyimac",
  "fyiwin.com": "fyiwin",
  "www.fyiwin.com": "fyiwin",
  "fyigoogle.com": "fyigoogle",
  "www.fyigoogle.com": "fyigoogle",
  "fyinetflix.com": "fyinetflix",
  "www.fyinetflix.com": "fyinetflix",
  "fyiflynow.com": "fyiflynow",
  "www.fyiflynow.com": "fyiflynow",
  "fyilakers.com": "fyilakers",
  "www.fyilakers.com": "fyilakers",
  "fyidodgers.com": "fyidodgers",
  "www.fyidodgers.com": "fyidodgers",
  "fyicams.com": "fyicams",
  "www.fyicams.com": "fyicams",

  // local dev: run `npm run dev` and visit these directly —
  // *.localhost resolves to 127.0.0.1 in every modern browser, no /etc/hosts needed.
  "fyimac.localhost:3000": "fyimac",
  "fyiwin.localhost:3000": "fyiwin",
  "fyigoogle.localhost:3000": "fyigoogle",
  "fyinetflix.localhost:3000": "fyinetflix",
  "fyiflynow.localhost:3000": "fyiflynow",
  "fyilakers.localhost:3000": "fyilakers",
  "fyidodgers.localhost:3000": "fyidodgers",
  "fyicams.localhost:3000": "fyicams",
};

const DEFAULT_SLUG = "fyimac"; // fallback for bare localhost:3000 during dev

// Aggressive SEO/scraping crawlers — not search engines (Googlebot, Bingbot,
// DuckDuckBot, etc. are deliberately NOT on this list; we want those, they
// drive the indexing this site's SEO work targets). Every hit from these
// currently costs a full no-store Fluid SSR render (see lib/api.ts's
// headers()-driven dynamic rendering), so rejecting them here at the Edge
// (unbilled) instead of letting them reach a page render is a clean win.
const BLOCKED_BOT_UA = [
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "blexbot",
  "petalbot",
];

function isBlockedBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BLOCKED_BOT_UA.some((bot) => ua.includes(bot));
}

export function middleware(request: NextRequest) {
  if (isBlockedBot(request.headers.get("user-agent") || "")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const host = request.headers.get("host") || "";
  const slug = DOMAIN_TO_SLUG[host] || DEFAULT_SLUG;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-brand-slug", slug);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Also expose it to client components via a readable (non-httpOnly) cookie,
  // so the DomainSwitcher can highlight "you are here" without a server round-trip.
  response.cookies.set("brand-slug", slug, { path: "/" });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
