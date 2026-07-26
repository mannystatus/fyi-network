// fyiFlyNow cross-promo module — embedded on fyiMac's and fyiNetflix's
// article pages (see CROSS_PROMO in app/[slug]/page.tsx). All styles are
// scoped under .fyi-flynow-promo so they don't leak into the host page,
// and carry fyiFlyNow's own branding regardless of which site it's
// rendered on — it's an ad for a different site, not themed content, so
// it deliberately doesn't blend into the host.
export default function FlyNowCrossPromo() {
  return (
    <div className="fyi-flynow-promo">
      <style>{`
    .fyi-flynow-promo {
      --navy:#06122b; --navy2:#0A1A3D; --line:#1C3363;
      --sky:#4FC3FF; --coral:#FF6B4A; --amber:#FFB627;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 640px;
      margin: 32px auto;
      background: radial-gradient(120% 160% at 15% 0%, #0e2352 0%, var(--navy) 65%);
      border: 1px solid #16264d;
      border-radius: 10px;
      padding: 28px 28px 26px;
      position: relative;
      overflow: hidden;
    }
    .fyi-flynow-promo::before {
      content:'';
      position:absolute; top:-40%; right:-15%;
      width:260px; height:260px;
      background: radial-gradient(circle, rgba(255,107,74,.22), transparent 70%);
      pointer-events:none;
    }
    .fyi-flynow-promo * { box-sizing: border-box; }

    .fyi-flynow-promo .ffn-kicker {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 10px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--coral);
      margin-bottom: 14px;
      position: relative;
    }

    .fyi-flynow-promo .ffn-logo {
      display: flex;
      gap: 2px;
      margin-bottom: 14px;
      position: relative;
    }
    .fyi-flynow-promo .ffn-flap {
      font-family: 'Archivo Black', sans-serif;
      font-size: 20px;
      color: #fff;
      background: var(--navy2);
      border: 1px solid var(--line);
      padding: 3px 6px 4px;
      border-radius: 2px;
      line-height: 1;
    }
    .fyi-flynow-promo .ffn-flap.sky { color: var(--sky); }
    .fyi-flynow-promo .ffn-flap.coral { color: var(--coral); }
    .fyi-flynow-promo .ffn-flap.amber { color: var(--amber); }

    .fyi-flynow-promo .ffn-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      flex-wrap: wrap;
      position: relative;
    }
    .fyi-flynow-promo .ffn-headline {
      font-family: 'Archivo Black', sans-serif;
      font-size: 22px;
      color: #fff;
      line-height: 1.25;
      max-width: 340px;
    }
    .fyi-flynow-promo .ffn-headline .accent { color: var(--amber); }
    .fyi-flynow-promo .ffn-sub {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 300;
      color: #9fb3d9;
      margin-top: 8px;
      max-width: 340px;
      line-height: 1.6;
    }
    .fyi-flynow-promo .ffn-cta {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--navy);
      background: var(--coral);
      padding: 12px 22px;
      border-radius: 30px;
      text-decoration: none;
      white-space: nowrap;
      letter-spacing: .02em;
      transition: transform .15s ease, background .15s ease;
      flex-shrink: 0;
    }
    .fyi-flynow-promo .ffn-cta:hover {
      background: var(--amber);
      transform: translateY(-1px);
    }

    .fyi-flynow-promo .ffn-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #16264d;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      color: #6a7fa8;
      letter-spacing: .04em;
      position: relative;
    }
    .fyi-flynow-promo .ffn-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--amber);
      display: inline-block;
      animation: ffn-pulse 1.8s ease-in-out infinite;
    }
    @keyframes ffn-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .3; }
    }

    @media (max-width: 480px) {
      .fyi-flynow-promo { padding: 22px 20px; }
      .fyi-flynow-promo .ffn-body { flex-direction: column; align-items: flex-start; }
      .fyi-flynow-promo .ffn-cta { width: 100%; text-align: center; }
    }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500&family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div className="ffn-kicker">From the fyi network</div>

      <div className="ffn-logo">
        <span className="ffn-flap sky">f</span>
        <span className="ffn-flap sky">y</span>
        <span className="ffn-flap sky">i</span>
        <span className="ffn-flap coral">F</span>
        <span className="ffn-flap coral">l</span>
        <span className="ffn-flap coral">y</span>
        <span className="ffn-flap amber">N</span>
        <span className="ffn-flap amber">o</span>
        <span className="ffn-flap amber">w</span>
      </div>

      <div className="ffn-body">
        <div>
          <div className="ffn-headline">
            We just launched a site that watches fares <span className="accent">so you don&apos;t have to.</span>
          </div>
          <div className="ffn-sub">
            Real-time flight deal alerts, tracked across hundreds of routes. New on the fyi network.
          </div>
        </div>
        <a className="ffn-cta" href="https://fyiflynow.com" target="_blank" rel="noopener">
          Check today&apos;s fares →
        </a>
      </div>

      <div className="ffn-foot">
        <span className="ffn-dot" />
        <span>NOW BOARDING · fyiFlyNow.com</span>
      </div>
    </div>
  );
}
