// fyiGoogle cross-promo module — embedded on fyiWin's article pages. All
// styles are scoped under .fyi-google-promo (and fgo- prefixed classes) so
// they don't collide with the host page or with fyiGoogle's own site theme.
export default function GoogleCrossPromo() {
  return (
    <div className="fyi-google-promo">
      <style>{`
    .fyi-google-promo {
      --ink:#202124; --paper:#fff; --line:#e8eaed;
      --blue:#4285F4; --red:#EA4335; --yellow:#FBBC05; --green:#34A853;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 640px;
      margin: 32px auto;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 28px 28px 26px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(60,64,67,.12), 0 4px 16px rgba(60,64,67,.08);
    }
    .fyi-google-promo::before {
      content:'';
      position:absolute; top:-30%; right:-10%;
      width:220px; height:220px;
      background: radial-gradient(circle, rgba(66,133,244,.12), transparent 70%);
      pointer-events:none;
    }
    .fyi-google-promo * { box-sizing: border-box; }

    .fyi-google-promo .fgo-kicker {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: #5f6368;
      margin-bottom: 14px;
      position: relative;
    }

    .fyi-google-promo .fgo-logo {
      display: flex;
      align-items: baseline;
      gap: 1px;
      margin-bottom: 14px;
      position: relative;
      font-size: 22px;
      font-weight: 500;
    }
    .fyi-google-promo .fgo-logo span:nth-child(1) { color: var(--ink); }
    .fyi-google-promo .fgo-logo span:nth-child(2) { color: var(--blue); }
    .fyi-google-promo .fgo-logo span:nth-child(3) { color: var(--red); }
    .fyi-google-promo .fgo-logo span:nth-child(4) { color: var(--yellow); }
    .fyi-google-promo .fgo-logo span:nth-child(5) { color: var(--blue); }
    .fyi-google-promo .fgo-logo span:nth-child(6) { color: var(--green); }
    .fyi-google-promo .fgo-logo span:nth-child(7) { color: var(--red); }
    .fyi-google-promo .fgo-logo span:nth-child(8) { color: var(--blue); }
    .fyi-google-promo .fgo-logo span:nth-child(9) { color: var(--green); }

    .fyi-google-promo .fgo-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      flex-wrap: wrap;
      position: relative;
    }
    .fyi-google-promo .fgo-headline {
      font-size: 21px;
      font-weight: 500;
      color: var(--ink);
      line-height: 1.3;
      max-width: 340px;
    }
    .fyi-google-promo .fgo-headline .accent { color: var(--blue); }
    .fyi-google-promo .fgo-sub {
      font-size: 13px;
      font-weight: 400;
      color: #5f6368;
      margin-top: 8px;
      max-width: 340px;
      line-height: 1.6;
    }
    .fyi-google-promo .fgo-cta {
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      background: var(--blue);
      padding: 12px 22px;
      border-radius: 30px;
      text-decoration: none;
      white-space: nowrap;
      letter-spacing: .01em;
      transition: transform .15s ease, background .15s ease;
      flex-shrink: 0;
    }
    .fyi-google-promo .fgo-cta:hover {
      background: #1a73e8;
      transform: translateY(-1px);
    }

    .fyi-google-promo .fgo-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      font-size: 11px;
      font-weight: 500;
      color: #5f6368;
      letter-spacing: .04em;
      position: relative;
    }
    .fyi-google-promo .fgo-dots {
      display: flex;
      gap: 3px;
    }
    .fyi-google-promo .fgo-dot {
      width: 6px; height: 6px; border-radius: 50%;
      animation: fgo-pulse 1.8s ease-in-out infinite;
    }
    .fyi-google-promo .fgo-dot:nth-child(1) { background: var(--blue); animation-delay: 0s; }
    .fyi-google-promo .fgo-dot:nth-child(2) { background: var(--red); animation-delay: .2s; }
    .fyi-google-promo .fgo-dot:nth-child(3) { background: var(--yellow); animation-delay: .4s; }
    .fyi-google-promo .fgo-dot:nth-child(4) { background: var(--green); animation-delay: .6s; }
    @keyframes fgo-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .25; }
    }

    @media (prefers-color-scheme: dark) {
      .fyi-google-promo {
        --ink:#e8eaed; --paper:#292a2d; --line:#3c4043;
      }
      .fyi-google-promo .fgo-kicker,
      .fyi-google-promo .fgo-sub,
      .fyi-google-promo .fgo-foot { color: #9aa0a6; }
    }

    @media (max-width: 480px) {
      .fyi-google-promo { padding: 22px 20px; }
      .fyi-google-promo .fgo-body { flex-direction: column; align-items: flex-start; }
      .fyi-google-promo .fgo-cta { width: 100%; text-align: center; }
    }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet" />

      <div className="fgo-kicker">From the fyi network</div>

      <div className="fgo-logo">
        <span>fyi</span>
        <span>G</span>
        <span>o</span>
        <span>o</span>
        <span>g</span>
        <span>l</span>
        <span>e</span>
      </div>

      <div className="fgo-body">
        <div>
          <div className="fgo-headline">
            Pixel launches, Android updates, Chrome tips <span className="accent">— decoded daily.</span>
          </div>
          <div className="fgo-sub">
            Everything Google, tracked and explained before it hits your feed. New on the fyi network.
          </div>
        </div>
        <a className="fgo-cta" href="https://fyigoogle.com" target="_blank" rel="noopener">
          Read fyiGoogle →
        </a>
      </div>

      <div className="fgo-foot">
        <span className="fgo-dots">
          <span className="fgo-dot" />
          <span className="fgo-dot" />
          <span className="fgo-dot" />
          <span className="fgo-dot" />
        </span>
        <span>INDEXED · fyiGoogle.com</span>
      </div>
    </div>
  );
}
