// fyiLakers cross-promo module — embedded on fyiFlyNow's article pages,
// extending the discovery chain (mac -> flynow, win -> google -> netflix ->
// flynow) one more hop into the network's newest brand. All styles are
// scoped under .fyi-lakers-promo (and lkp- prefixed classes) so they don't
// collide with the host page or with fyiLakers's own site theme classes
// (.lakers-titlebar etc.).
export default function LakersCrossPromo() {
  return (
    <div className="fyi-lakers-promo">
      <style>{`
    .fyi-lakers-promo {
      --purple:#4b1f73; --purple2:#3a1859; --line:#5c3480;
      --gold:#fdb927; --white:#f5f5f0;
      font-family: 'Oswald', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      max-width: 640px;
      margin: 32px auto;
      background: radial-gradient(120% 160% at 85% 0%, #6b3aa0 0%, var(--purple) 65%);
      border: 1px solid var(--line);
      border-top: 3px solid var(--gold);
      border-radius: 10px;
      padding: 28px 28px 26px;
      position: relative;
      overflow: hidden;
    }
    .fyi-lakers-promo::before {
      content:'';
      position:absolute; top:-40%; right:-15%;
      width:260px; height:260px;
      background: radial-gradient(circle, rgba(253,185,39,.22), transparent 70%);
      pointer-events:none;
    }
    .fyi-lakers-promo * { box-sizing: border-box; }

    .fyi-lakers-promo .lkp-kicker {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 14px;
      position: relative;
    }

    .fyi-lakers-promo .lkp-logo {
      font-family: 'Oswald', sans-serif;
      font-weight: 600;
      font-size: 26px;
      letter-spacing: .01em;
      color: var(--gold);
      text-transform: uppercase;
      margin-bottom: 14px;
      position: relative;
    }
    .fyi-lakers-promo .lkp-logo .dim { color: var(--white); }

    .fyi-lakers-promo .lkp-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      flex-wrap: wrap;
      position: relative;
    }
    .fyi-lakers-promo .lkp-headline {
      font-family: 'Oswald', sans-serif;
      font-weight: 500;
      font-size: 21px;
      color: var(--white);
      line-height: 1.3;
      max-width: 340px;
      text-transform: none;
    }
    .fyi-lakers-promo .lkp-headline .accent { color: var(--gold); }
    .fyi-lakers-promo .lkp-sub {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 300;
      color: #d9c7ee;
      margin-top: 8px;
      max-width: 340px;
      line-height: 1.6;
    }
    .fyi-lakers-promo .lkp-cta {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--purple2);
      background: var(--gold);
      padding: 12px 22px;
      border-radius: 4px;
      text-decoration: none;
      white-space: nowrap;
      letter-spacing: .02em;
      transition: transform .15s ease, background .15s ease;
      flex-shrink: 0;
    }
    .fyi-lakers-promo .lkp-cta:hover {
      background: #ffc851;
      transform: translateY(-1px);
    }

    .fyi-lakers-promo .lkp-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: #c7b3dd;
      letter-spacing: .04em;
      position: relative;
    }
    .fyi-lakers-promo .lkp-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--gold);
      display: inline-block;
      animation: lkp-pulse 1.8s ease-in-out infinite;
    }
    @keyframes lkp-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .3; }
    }

    @media (max-width: 480px) {
      .fyi-lakers-promo { padding: 22px 20px; }
      .fyi-lakers-promo .lkp-body { flex-direction: column; align-items: flex-start; }
      .fyi-lakers-promo .lkp-cta { width: 100%; text-align: center; }
    }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&display=swap" rel="stylesheet" />

      <div className="lkp-kicker">From the fyi network</div>

      <div className="lkp-logo">
        fyi<span className="dim">Lakers</span>
      </div>

      <div className="lkp-body">
        <div>
          <div className="lkp-headline">
            Trade rumors, injury reports, game recaps <span className="accent">— before tip-off talk catches up.</span>
          </div>
          <div className="lkp-sub">
            Lakers news, decoded daily. New on the fyi network.
          </div>
        </div>
        <a className="lkp-cta" href="https://fyilakers.com" target="_blank" rel="noopener">
          See the latest →
        </a>
      </div>

      <div className="lkp-foot">
        <span className="lkp-dot" />
        <span>LIVE COVERAGE · fyiLakers.com</span>
      </div>
    </div>
  );
}
