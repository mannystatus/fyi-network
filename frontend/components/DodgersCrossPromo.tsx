// fyiDodgers cross-promo module — embedded on fyiLakers's article pages,
// extending the discovery chain one more hop into the network's newest
// brand (mac -> flynow, win -> google -> netflix -> flynow -> lakers ->
// dodgers). All styles are scoped under .fyi-dodgers-promo (and dkp-
// prefixed classes) so they don't collide with the host page or with
// fyiDodgers's own site theme classes (.dodgers-titlebar etc.).
export default function DodgersCrossPromo() {
  return (
    <div className="fyi-dodgers-promo">
      <style>{`
    .fyi-dodgers-promo {
      --blue:#005a9c; --blue2:#003d6b; --line:#2c6a9e;
      --sky:#7dcfff; --white:#f5f5f0;
      font-family: 'Oswald', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      max-width: 640px;
      margin: 32px auto;
      background: radial-gradient(120% 160% at 85% 0%, #1c7fc4 0%, var(--blue) 65%);
      border: 1px solid var(--line);
      border-top: 3px solid var(--white);
      border-radius: 10px;
      padding: 28px 28px 26px;
      position: relative;
      overflow: hidden;
    }
    .fyi-dodgers-promo::before {
      content:'';
      position:absolute; top:-40%; right:-15%;
      width:260px; height:260px;
      background: radial-gradient(circle, rgba(125,207,255,.22), transparent 70%);
      pointer-events:none;
    }
    .fyi-dodgers-promo * { box-sizing: border-box; }

    .fyi-dodgers-promo .dkp-kicker {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--sky);
      margin-bottom: 14px;
      position: relative;
    }

    .fyi-dodgers-promo .dkp-logo {
      font-family: 'Oswald', sans-serif;
      font-weight: 600;
      font-size: 26px;
      letter-spacing: .01em;
      color: var(--white);
      text-transform: uppercase;
      margin-bottom: 14px;
      position: relative;
    }
    .fyi-dodgers-promo .dkp-logo .dim { color: var(--sky); }

    .fyi-dodgers-promo .dkp-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      flex-wrap: wrap;
      position: relative;
    }
    .fyi-dodgers-promo .dkp-headline {
      font-family: 'Oswald', sans-serif;
      font-weight: 500;
      font-size: 21px;
      color: var(--white);
      line-height: 1.3;
      max-width: 340px;
      text-transform: none;
    }
    .fyi-dodgers-promo .dkp-headline .accent { color: var(--sky); }
    .fyi-dodgers-promo .dkp-sub {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 300;
      color: #bcdcf0;
      margin-top: 8px;
      max-width: 340px;
      line-height: 1.6;
    }
    .fyi-dodgers-promo .dkp-cta {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--blue2);
      background: var(--white);
      padding: 12px 22px;
      border-radius: 4px;
      text-decoration: none;
      white-space: nowrap;
      letter-spacing: .02em;
      transition: transform .15s ease, background .15s ease;
      flex-shrink: 0;
    }
    .fyi-dodgers-promo .dkp-cta:hover {
      background: #ffffff;
      transform: translateY(-1px);
    }

    .fyi-dodgers-promo .dkp-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: #a9cbe0;
      letter-spacing: .04em;
      position: relative;
    }
    .fyi-dodgers-promo .dkp-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--sky);
      display: inline-block;
      animation: dkp-pulse 1.8s ease-in-out infinite;
    }
    @keyframes dkp-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .3; }
    }

    @media (max-width: 480px) {
      .fyi-dodgers-promo { padding: 22px 20px; }
      .fyi-dodgers-promo .dkp-body { flex-direction: column; align-items: flex-start; }
      .fyi-dodgers-promo .dkp-cta { width: 100%; text-align: center; }
    }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&display=swap" rel="stylesheet" />

      <div className="dkp-kicker">From the fyi network</div>

      <div className="dkp-logo">
        fyi<span className="dim">Dodgers</span>
      </div>

      <div className="dkp-body">
        <div>
          <div className="dkp-headline">
            Trade rumors, injury reports, game recaps <span className="accent">— before the next series starts.</span>
          </div>
          <div className="dkp-sub">
            Dodgers news, decoded daily. New on the fyi network.
          </div>
        </div>
        <a className="dkp-cta" href="https://fyidodgers.com" target="_blank" rel="noopener">
          See the latest →
        </a>
      </div>

      <div className="dkp-foot">
        <span className="dkp-dot" />
        <span>LIVE COVERAGE · fyiDodgers.com</span>
      </div>
    </div>
  );
}
