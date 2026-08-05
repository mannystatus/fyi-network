// fyiCams's structured "Review" content — score, verdict, pros/cons, specs,
// and a head-to-head comparison table. There's no backend support for this
// shape yet (no score/pros/cons/spec columns on Article — see the add-brand
// plan), so for v1 this is hand-maintained config, same pattern as
// buyersGuideRegistry.ts's per-brand product data. Keyed by slug, which
// doubles as both the /reviews/[slug] path AND (optionally) a real Article
// slug authored via /admin with the same slug, so [slug]/page.tsx can show
// a "Read full review" sidebar linking the two together.

export type CamsSpecRow = { label: string; value: string };
export type CamsComparisonRow = { spec: string; product: string; rivalA: string; rivalB: string };

export type CamsReview = {
  slug: string;
  productName: string;
  category: string;
  priceLine: string; // e.g. "Third-party 50mm f/1.8 · $349 · Full-frame & APS-C mounts"
  imageUrl?: string; // falls back to the striped placeholder box when unset
  score: number;
  verdictLabel: string; // "Editor's Choice"
  verdict: string;
  pros: string[];
  cons: string[];
  specsShort: CamsSpecRow[]; // 5 rows, shown in the article sidebar
  specsFull: CamsSpecRow[]; // full spec table on the review page
  rivalNames: [string, string];
  comparisonRows: CamsComparisonRow[];
  sponsoredPrice?: string;
};

export const CAMS_REVIEWS: Record<string, CamsReview> = {
  "compact-50mm-prime-review": {
    slug: "compact-50mm-prime-review",
    productName: "Compact 50mm f/1.8 prime",
    category: "Compact Prime Lens",
    priceLine: "Third-party 50mm f/1.8 · $349 · Full-frame & APS-C mounts",
    score: 9.1,
    verdictLabel: "Editor's Choice",
    verdict:
      "Center sharpness rivals lenses three times the price, with autofocus speed that surprised every tester on staff.",
    pros: [
      "Exceptional center sharpness wide open",
      "Fast, near-silent autofocus motor",
      "Compact and lightweight for daily carry",
      "Priced well below comparable primes",
    ],
    cons: ["Soft corners until f/2.2", "No weather sealing", "Plastic mount on the base version"],
    specsShort: [
      { label: "Mount", value: "Full-frame / APS-C" },
      { label: "Max aperture", value: "f/1.8" },
      { label: "Weight", value: "203g" },
      { label: "Price", value: "$349" },
      { label: "Our score", value: "9.1 / 10" },
    ],
    specsFull: [
      { label: "Focal length", value: "50mm" },
      { label: "Max aperture", value: "f/1.8" },
      { label: "Min aperture", value: "f/16" },
      { label: "Elements / groups", value: "7 / 6" },
      { label: "Autofocus motor", value: "Linear STM" },
      { label: "Minimum focus distance", value: "0.38m" },
      { label: "Filter thread", value: "52mm" },
      { label: "Weight", value: "203g" },
    ],
    rivalNames: ["Rival A", "Rival B"],
    comparisonRows: [
      { spec: "Price", product: "$349", rivalA: "$599", rivalB: "$449" },
      { spec: "Center sharpness (MTF)", product: "0.82", rivalA: "0.79", rivalB: "0.71" },
      { spec: "AF speed (0.2s test)", product: "Pass", rivalA: "Pass", rivalB: "Fail" },
      { spec: "Weight", product: "203g", rivalA: "305g", rivalB: "240g" },
      { spec: "Weather sealing", product: "No", rivalA: "Yes", rivalB: "No" },
    ],
    sponsoredPrice: "$349 at our retail partner",
  },
  "sony-a7r-vi-review": {
    slug: "sony-a7r-vi-review",
    productName: "Sony A7R VI",
    category: "High-Resolution Mirrorless",
    priceLine: "66.8MP stacked full-frame · $4,500 · Sony E-mount",
    score: 9.2,
    verdictLabel: "Editor's Choice",
    verdict:
      "The first R-series body that doesn't ask you to choose between resolution and speed — 66.8MP at up to 30fps with full AF tracking.",
    pros: [
      "66.8MP stacked sensor with 8K video",
      "30fps burst with full AI-tracked autofocus",
      "8.5-stop 5-axis in-body stabilization",
      "Higher-capacity SA-type battery (+27%)",
    ],
    cons: [
      "Most expensive A7R yet (~$4,500)",
      "Paper-thin shutter blades, easy to crease when cleaning",
      "No open-gate video; rear screen lacks HDR",
      "New USB connector breaks older Multi-accessory compatibility",
    ],
    specsShort: [
      { label: "Sensor", value: "66.8MP stacked full-frame" },
      { label: "Burst speed", value: "30 fps w/ AF tracking" },
      { label: "IBIS", value: "8.5 stops" },
      { label: "Video", value: "8K" },
      { label: "Our score", value: "9.2 / 10" },
    ],
    specsFull: [
      { label: "Sensor", value: "66.8MP stacked full-frame BSI CMOS" },
      { label: "Processor", value: "BIONZ XR2 (AI-assisted subject recognition)" },
      { label: "Continuous shooting", value: "30 fps electronic, full AF/AE tracking" },
      { label: "Stabilization", value: "5-axis IBIS, rated to 8.5 stops" },
      { label: "Video", value: "8K, no open-gate mode" },
      { label: "Battery", value: "New 'SA'-type, 20.9Wh (+27% vs. prior Alpha bodies)" },
      { label: "Mount", value: "Sony E" },
      { label: "Price", value: "~$4,500 body-only" },
    ],
    rivalNames: ["Canon EOS R5 II", "Nikon Z8"],
    comparisonRows: [
      { spec: "Price", product: "$4,500", rivalA: "$4,299", rivalB: "$3,997" },
      { spec: "Resolution", product: "66.8MP", rivalA: "45MP", rivalB: "45.7MP" },
      { spec: "Max burst speed", product: "30 fps", rivalA: "30 fps (electronic)", rivalB: "20 fps (mechanical)" },
      { spec: "IBIS rating", product: "8.5 stops", rivalA: "8 stops", rivalB: "6 stops" },
      { spec: "Video", product: "8K", rivalA: "8K RAW", rivalB: "8K30" },
    ],
  },
  "leica-sl3-p-review": {
    slug: "leica-sl3-p-review",
    productName: "Leica SL3-P",
    category: "Full-Frame Mirrorless",
    priceLine: "44MP full-frame · $6,690 body-only · L-mount",
    score: 8.8,
    verdictLabel: "Highly Recommended",
    verdict:
      "Leica's fastest camera ever — a 44MP sensor with autofocus that finally justifies using it as a working camera, not just a beautiful second body.",
    pros: [
      "44MP BSI sensor with 14 stops of dynamic range",
      "819-point hybrid AF with ML subject recognition",
      "40fps burst with full AF tracking",
      "8K open-gate, ProRes, and 4K/120p video",
    ],
    cons: [
      "Heavy for its class",
      "Screen tilts but doesn't swivel",
      "AF still trails Sony/Canon on raw tracking speed",
      "Only 4 labeled buttons — touchscreen-heavy control layout",
    ],
    specsShort: [
      { label: "Sensor", value: "44MP full-frame BSI" },
      { label: "Burst speed", value: "40 fps w/ AF tracking" },
      { label: "AF points", value: "819 phase-detect" },
      { label: "Video", value: "8K open-gate" },
      { label: "Our score", value: "8.8 / 10" },
    ],
    specsFull: [
      { label: "Sensor", value: "44MP full-frame BSI CMOS, 14 stops DR" },
      { label: "ISO range", value: "Native ISO 50–200,000" },
      { label: "Autofocus", value: "819-point hybrid PDAF, ML subject recognition" },
      { label: "Continuous shooting", value: "40 fps with full AF tracking" },
      { label: "Video", value: "8K open-gate, ProRes, 4K up to 120p" },
      { label: "Screen", value: "Tilting touchscreen (no swivel)" },
      { label: "Mount", value: "L-mount" },
      { label: "Price", value: "$6,690 body-only" },
    ],
    rivalNames: ["Panasonic Lumix S1R II", "Sony A7R VI"],
    comparisonRows: [
      { spec: "Price", product: "$6,690", rivalA: "$3,299", rivalB: "$4,500" },
      { spec: "Resolution", product: "44MP", rivalA: "44MP", rivalB: "66.8MP" },
      { spec: "Max burst speed", product: "40 fps", rivalA: "40 fps", rivalB: "30 fps" },
      { spec: "Video", product: "8K open-gate", rivalA: "8K ProRes", rivalB: "8K" },
      { spec: "Mount", product: "L-mount", rivalA: "L-mount", rivalB: "Sony E" },
    ],
  },
  "leica-m-ev1-review": {
    slug: "leica-m-ev1-review",
    productName: "Leica M EV1",
    category: "Rangefinder-Style Mirrorless",
    priceLine: "60.3MP full-frame · $8,995 body-only · Leica M-mount",
    score: 9.1,
    verdictLabel: "Editor's Choice",
    verdict:
      "The purest M Leica has ever built. Cutting video and autofocus wasn't a limitation — it was the point: every part of this camera, from the sensor to the new EVF, exists to serve the photograph and nothing else. For photographers tired of buying compromise, this is the clearest, most focused stills tool on the market.",
    pros: [
      "A pure photography tool — no video mode diluting the sensor, processor, or handling",
      "First M with a built-in EVF (5.76m-dot, 0.76x, 100% coverage)",
      "60.3MP sensor, selectable 60/36/18MP output",
      "15 stops of dynamic range",
      "Best EVF battery life of any mirrorless in its class",
    ],
    cons: [
      "No autofocus, even with native M lenses",
      "No in-body stabilization",
      "~237–244 shot battery life; fixed, non-tilting screen",
      "EVF frame rate drops and shows a 'jello' effect in low light",
    ],
    specsShort: [
      { label: "Sensor", value: "60.3MP full-frame BSI" },
      { label: "Viewfinder", value: "5.76m-dot EVF, 0.76x" },
      { label: "Autofocus", value: "None — manual only" },
      { label: "Video", value: "Not supported" },
      { label: "Our score", value: "9.1 / 10" },
    ],
    specsFull: [
      { label: "Sensor", value: "60.3MP full-frame BSI CMOS, 15 stops DR" },
      { label: "Output resolution", value: "60MP / 36MP / 18MP, full sensor area" },
      { label: "Viewfinder", value: "5.76m-dot OLED EVF, 0.76x magnification, 100% coverage" },
      { label: "Autofocus", value: "None — manual focus with focus peaking" },
      { label: "Stabilization", value: "None" },
      { label: "ISO range", value: "ISO 64–50,000" },
      { label: "Battery life", value: "~237 shots (EVF) / ~244 shots (LCD)" },
      { label: "Price", value: "$8,995 body-only" },
    ],
    rivalNames: ["Leica M11-P", "Leica M11 Monochrom"],
    comparisonRows: [
      { spec: "Price", product: "$8,995", rivalA: "$9,195", rivalB: "$9,195" },
      { spec: "Resolution", product: "60.3MP", rivalA: "60MP", rivalB: "60MP (monochrome)" },
      { spec: "Viewfinder", product: "Built-in EVF", rivalA: "Optical rangefinder", rivalB: "Optical rangefinder" },
      { spec: "Autofocus", product: "None", rivalA: "None", rivalB: "None" },
      { spec: "Video", product: "None", rivalA: "None", rivalB: "None" },
    ],
  },
  "nikon-zr-review": {
    slug: "nikon-zr-review",
    productName: "Nikon ZR",
    category: "Compact Cinema Camera",
    priceLine: "25MP full-frame · $2,200 · Nikon Z-mount",
    score: 9.1,
    verdictLabel: "Editor's Choice",
    verdict:
      "A $2,200 body that shoots 6K RED RAW — the camera nobody expected Nikon to make, and arguably the best RAW video value available.",
    pros: [
      "6K RAW via N-RAW, ProRes RAW, and RED's R3D NE",
      "8 stops of 5-axis IBIS plus electronic VR",
      "32-bit float internal audio",
      "4-inch, 1000-nit rear screen",
    ],
    cons: [
      "No built-in electronic viewfinder",
      "Battery life falls short of a full day's shoot",
      "H.265 clips need ~1 second of lead-in before bitrate stabilizes",
      "No included cage or grip for a video-first body",
    ],
    specsShort: [
      { label: "Sensor", value: "25MP partially-stacked full-frame" },
      { label: "Internal RAW", value: "N-RAW / ProRes RAW / R3D NE" },
      { label: "IBIS", value: "8 stops" },
      { label: "Screen", value: "4\" 1000-nit LCD" },
      { label: "Our score", value: "9.1 / 10" },
    ],
    specsFull: [
      { label: "Sensor", value: "25MP partially-stacked full-frame CMOS" },
      { label: "Processor", value: "Expeed 7" },
      { label: "Internal RAW", value: "N-RAW, Apple ProRes RAW, RED R3D NE" },
      { label: "Max video", value: "6K/60p RAW" },
      { label: "Stabilization", value: "8-stop 5-axis IBIS + electronic VR" },
      { label: "Audio", value: "32-bit float" },
      { label: "Weight", value: "540g (1.19 lb)" },
      { label: "Price", value: "$2,200" },
    ],
    rivalNames: ["Sony FX3", "Canon EOS C70"],
    comparisonRows: [
      { spec: "Price", product: "$2,200", rivalA: "$3,900", rivalB: "$5,499" },
      { spec: "Sensor", product: "25MP full-frame", rivalA: "12.1MP full-frame", rivalB: "Super 35 DGO" },
      { spec: "Internal RAW", product: "N-RAW / ProRes RAW / R3D NE", rivalA: "No", rivalB: "No" },
      { spec: "IBIS", product: "Yes, 8 stops", rivalA: "No", rivalB: "No" },
      { spec: "Weight", product: "540g", rivalA: "716g", rivalB: "1,170g" },
    ],
  },
  "dji-osmo-action-6-review": {
    slug: "dji-osmo-action-6-review",
    productName: "DJI Osmo Action 6",
    category: "Action Camera",
    priceLine: "1/1.1\" sensor · $369–$439 · Variable f/2.0–f/4.0 aperture",
    score: 9.0,
    verdictLabel: "Editor's Choice",
    verdict:
      "The first action camera with a variable aperture — and the new low-light leader in the category, GoPro and Insta360 included.",
    pros: [
      "First variable f/2.0–f/4.0 aperture in an action cam",
      "1/1.1\" sensor with 13.5 stops of dynamic range",
      "SuperNight mode for clean low-light 4K/60",
      "~4-hour battery life with fast USB-C charging",
    ],
    cons: [
      "No first-party U.S. retail presence for DJI cameras",
      "GoPro's HyperSmooth still edges it out on extreme high-frequency vibration",
      "Insta360's Leica-tuned Ace Pro 2 remains close on absolute low-light noise",
      "Extra batteries and mounts add up past the $369 base price",
    ],
    specsShort: [
      { label: "Sensor", value: "1/1.1\" CMOS" },
      { label: "Aperture", value: "Variable f/2.0–f/4.0" },
      { label: "Dynamic range", value: "13.5 stops" },
      { label: "Max video", value: "4K/120 (4:3), 8K capture" },
      { label: "Our score", value: "9.0 / 10" },
    ],
    specsFull: [
      { label: "Sensor", value: "1/1.1\" CMOS, 13.5 stops dynamic range" },
      { label: "Aperture", value: "Variable f/2.0–f/4.0 (first in an action camera)" },
      { label: "Max video", value: "4K/120p (4:3) + 8K capture mode" },
      { label: "Low-light mode", value: "SuperNight — clean 4K/60p in the dark" },
      { label: "Battery", value: "1,950mAh, ~4 hours, 18-min USB-C fast charge to 80%" },
      { label: "Price", value: "$369 (Standard) / $439 (bundle)" },
    ],
    rivalNames: ["GoPro Mission 1 Pro", "Insta360 Ace Pro 2"],
    comparisonRows: [
      { spec: "Price", product: "$369–$439", rivalA: "$699.99", rivalB: "$399" },
      { spec: "Sensor", product: "1/1.1\"", rivalA: "1\" (50MP)", rivalB: "1/1.3\" (50MP)" },
      { spec: "Aperture", product: "Variable f/2.0–f/4.0", rivalA: "Fixed", rivalB: "Fixed" },
      { spec: "Max video", product: "4K120 (4:3) + 8K", rivalA: "8K60", rivalB: "8K30" },
      { spec: "Dynamic range", product: "13.5 stops", rivalA: "—", rivalB: "13.5 stops" },
    ],
  },
};
