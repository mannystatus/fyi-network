// fyiNetflix cross-promo module — embedded on fyiGoogle's article pages.
// All styles are scoped under .fyi-netflix-promo (and fnx- prefixed
// classes) so they don't collide with the host page or with fyiNetflix's
// own site theme classes (.netflix-titlebar etc.).
export default function NetflixCrossPromo() {
  return (
    <div className="fyi-netflix-promo">
      <style>{`
    .fyi-netflix-promo {
      --black:#0a0a0a; --black2:#141414; --line:#2a2a2a;
      --red:#E50914; --white:#fff;
      font-family: 'Oswald', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      max-width: 640px;
      margin: 32px auto;
      background: radial-gradient(120% 160% at 85% 0%, #2b0507 0%, var(--black) 65%);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 28px 28px 26px;
      position: relative;
      overflow: hidden;
    }
    .fyi-netflix-promo::before {
      content:'';
      position:absolute; top:-40%; left:-15%;
      width:260px; height:260px;
      background: radial-gradient(circle, rgba(229,9,20,.25), transparent 70%);
      pointer-events:none;
    }
    .fyi-netflix-promo * { box-sizing: border-box; }

    .fyi-netflix-promo .fnx-kicker {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--red);
      margin-bottom: 14px;
      position: relative;
    }

    .fyi-netflix-promo .fnx-logo {
      font-family: 'Oswald', sans-serif;
      font-weight: 700;
      font-size: 26px;
      letter-spacing: .01em;
      color: var(--red);
      text-transform: uppercase;
      margin-bottom: 14px;
      position: relative;
    }
    .fyi-netflix-promo .fnx-logo .dim { color: #fff; }

    .fyi-netflix-promo .fnx-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      flex-wrap: wrap;
      position: relative;
    }
    .fyi-netflix-promo .fnx-headline {
      font-family: 'Oswald', sans-serif;
      font-weight: 500;
      font-size: 21px;
      color: #fff;
      line-height: 1.3;
      max-width: 340px;
      text-transform: none;
    }
    .fyi-netflix-promo .fnx-headline .accent { color: var(--red); }
    .fyi-netflix-promo .fnx-sub {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 300;
      color: #b3b3b3;
      margin-top: 8px;
      max-width: 340px;
      line-height: 1.6;
    }
    .fyi-netflix-promo .fnx-cta {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      background: var(--red);
      padding: 12px 22px;
      border-radius: 4px;
      text-decoration: none;
      white-space: nowrap;
      letter-spacing: .02em;
      transition: transform .15s ease, background .15s ease;
      flex-shrink: 0;
    }
    .fyi-netflix-promo .fnx-cta:hover {
      background: #f6121d;
      transform: translateY(-1px);
    }

    .fyi-netflix-promo .fnx-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: #808080;
      letter-spacing: .04em;
      position: relative;
    }
    .fyi-netflix-promo .fnx-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--red);
      display: inline-block;
      animation: fnx-pulse 1.8s ease-in-out infinite;
    }
    @keyframes fnx-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .3; }
    }

    @media (max-width: 480px) {
      .fyi-netflix-promo { padding: 22px 20px; }
      .fyi-netflix-promo .fnx-body { flex-direction: column; align-items: flex-start; }
      .fyi-netflix-promo .fnx-cta { width: 100%; text-align: center; }
    }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap" rel="stylesheet" />

      <div className="fnx-kicker">From the fyi network</div>

      <div className="fnx-logo">
        fyi<span className="dim">Netflix</span>
      </div>

      <div className="fnx-body">
        <div>
          <div className="fnx-headline">
            K-dramas, renewals, Top 10 shifts <span className="accent">— before your feed catches up.</span>
          </div>
          <div className="fnx-sub">
            Netflix news and premiere tracking, updated daily. New on the fyi network.
          </div>
        </div>
        <a className="fnx-cta" href="https://fyinetflix.com" target="_blank" rel="noopener">
          See what&apos;s new →
        </a>
      </div>

      <div className="fnx-foot">
        <span className="fnx-dot" />
        <span>NOW STREAMING · fyiNetflix.com</span>
      </div>
    </div>
  );
}
