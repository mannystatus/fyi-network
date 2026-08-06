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
  "sony-a7r-vi-review": {
    slug: "sony-a7r-vi-review",
    productName: "Sony A7R VI",
    category: "High-Resolution Mirrorless",
    priceLine: "66.8MP stacked full-frame · $4,500 · Sony E-mount",
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/e2576a0d12e14764b9c8b21601bd7822-T0syYee7aFViRsdKOKp48pYIX3UV8v.jpg",
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
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/864f529d30d647a5a2de4da030729ca7-O2cig6ZzbAuSd8AdJbqS1YHQoqk6li.jpg",
    score: 8.8,
    verdictLabel: "Coming Soon",
    verdict: "Full review coming soon.",
    pros: [
      "44MP BSI sensor with 14 stops of dynamic range",
      "819-point hybrid AF with ML subject recognition",
      "40fps burst with full AF tracking",
      "8K open-gate, ProRes, and 4K/120p video",
    ],
    cons: [],
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
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/157cf8cdd9b5499ea9ae14a2c53d43c6-9e8yckFRmd8N9cOacWfbThUVRxdiMM.jpg",
    score: 9.6,
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
      { label: "Our score", value: "9.6 / 10" },
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
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/17a9f80c3c1d4638945554f2c884da42-ejBsLnZRDHQuTHLVKeyO3qsKAtkPhe.jpg",
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
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/7c3eb7bb16b14d6ebab8a1ac1a0dd311-Yjm72JFYw6kyrToNr1kfQMB7ZmqCcJ.jpg",
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
  "dji-osmo-pocket-4p-review": {
    slug: "dji-osmo-pocket-4p-review",
    productName: "DJI Osmo Pocket 4P",
    category: "Dual-Lens Pocket Gimbal Camera",
    priceLine: "1\" + 1/1.28\" dual-lens · €599 official (~$1,000 import) · 3x optical zoom",
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/94020c9fe72a4b9aa0740885f9286055-RwD10rDr6UT6B4dj2el2iOgKW7lyBe.jpg",
    score: 9.0,
    verdictLabel: "Editor's Choice",
    verdict:
      "DJI's first dual-lens pocket gimbal changes what a camera this small can do — true optical zoom between two genuinely good lenses, and 17 stops of dynamic range that embarrasses cameras costing six times as much. The only real catch is getting one: it isn't officially sold in the US.",
    pros: [
      "True 3x optical zoom between two lenses — a first for pocket gimbal cameras",
      "17 stops of dynamic range in D-Log 2, rivaling cameras costing far more",
      "Excellent low-light performance for its size",
      "Fast 800MB/s transfer speeds and 103GB of built-in storage",
    ],
    cons: [
      "Not officially sold in the US — import pricing runs roughly $1,000 vs. €599 official",
      "D-Log 2 disables zoom and slow-motion, and caps ISO at 3,200",
      "Noticeable exposure and color shift when switching lenses",
      "Missing pro monitoring tools like zebras and histograms",
    ],
    specsShort: [
      { label: "Lenses", value: "20mm f/2.0 (1\") + 60mm f/1.8 (1/1.28\")" },
      { label: "Zoom", value: "3x optical, 12x digital" },
      { label: "Max video", value: "4K up to 240fps" },
      { label: "Dynamic range", value: "17 stops (D-Log 2)" },
      { label: "Our score", value: "9.0 / 10" },
    ],
    specsFull: [
      { label: "Primary lens", value: "20mm-equiv f/2.0, 1\" sensor" },
      { label: "Secondary lens", value: "60mm-equiv f/1.8, 1/1.28\" sensor" },
      { label: "Zoom", value: "3x true optical, 6x in-sensor, 12x digital max" },
      { label: "Max resolution", value: "4K video, 37MP stills" },
      { label: "Frame rates", value: "Up to 240fps slow motion" },
      { label: "Dynamic range", value: "17 stops, D-Log 2 mode, primary lens only" },
      { label: "Display", value: "2\" OLED touchscreen" },
      { label: "Storage", value: "103GB internal + microSD" },
      { label: "Battery", value: "1,545mAh, ~200–220 min real-world" },
      { label: "Price", value: "€599 official / ~$1,000 import (not officially sold in the US)" },
    ],
    rivalNames: ["Insta360 Luna Ultra", "DJI Osmo Pocket 3"],
    comparisonRows: [
      { spec: "Price", product: "~$1,000 (import)", rivalA: "$769.99", rivalB: "$429" },
      { spec: "Lenses", product: "Dual (20mm + 60mm)", rivalA: "Dual (20mm + 60mm)", rivalB: "Single (20mm)" },
      { spec: "Optical zoom", product: "3x", rivalA: "3x", rivalB: "None (4x digital)" },
      { spec: "Max video", product: "4K/240", rivalA: "8K/30, 4K/120", rivalB: "4K/120" },
      { spec: "Dynamic range", product: "17 stops", rivalA: "—", rivalB: "—" },
    ],
  },
  "insta360-luna-ultra-review": {
    slug: "insta360-luna-ultra-review",
    productName: "Insta360 Luna Ultra",
    category: "Dual-Lens Pocket Gimbal Camera",
    priceLine: "1\" dual Leica-tuned lenses · $769.99 · 8K/30, 4K/120",
    imageUrl: "https://a1134mfa97i8kxjl.public.blob.vercel-storage.com/uploads/dd6eb9c5d1684343bd0dd822babf67ca-Pn1KIUFqEQ8wJH3bE9j1hRh1bwvSQ8.jpg",
    score: 9.1,
    verdictLabel: "Editor's Choice",
    verdict:
      "The dual-lens pocket gimbal camera you can actually buy in the US. Leica-tuned optics, a detachable touchscreen you can hand to a subject, and 8K capture put it right at the front of a category DJI just invented — without DJI's import-only availability problem.",
    pros: [
      "Leica-tuned dual lenses (20mm f/1.8 + 60mm f/2) with genuinely sharp results",
      "Detachable 2\" touchscreen — unique in the category, useful for vlogging and handoff shots",
      "8K/30 and 4K/120 video, well ahead of most pocket gimbal rivals",
      "Actually available through normal US retail — DJI's closest rival isn't",
    ],
    cons: [
      "Smaller built-in storage than DJI's Pocket 4P — 47GB vs. 103GB",
      "Detachable screen is one more part to lose or forget to charge",
      "First-generation dual-lens hardware from Insta360 — less of a track record than DJI's gimbal line",
      "Bulkier than DJI's single-lens Pocket 3",
    ],
    specsShort: [
      { label: "Lenses", value: "20mm f/1.8 + 60mm f/2 (Leica-tuned)" },
      { label: "Max video", value: "8K/30, 4K/120" },
      { label: "Display", value: "2\" detachable OLED, 1000 nits" },
      { label: "Battery", value: "~2h47m recorded at 4K/24" },
      { label: "Our score", value: "9.1 / 10" },
    ],
    specsFull: [
      { label: "Primary lens", value: "20mm-equiv f/1.8, Leica Summicron-tuned" },
      { label: "Secondary lens", value: "60mm-equiv f/2, Leica-tuned telephoto" },
      { label: "Max resolution", value: "8K/30, 4K up to 120fps, 1080p up to 240fps" },
      { label: "Color profile", value: "10-bit I-Log" },
      { label: "Display", value: "2\" OLED, 1000 nits, detachable, 20m remote range" },
      { label: "Storage", value: "47GB internal + microSD up to 1TB" },
      { label: "Battery", value: "~2h47m recorded at 4K/24" },
      { label: "Price", value: "$769.99 (Standard bundle)" },
    ],
    rivalNames: ["DJI Osmo Pocket 4P", "DJI Osmo Pocket 3"],
    comparisonRows: [
      { spec: "Price", product: "$769.99", rivalA: "~$1,000 (import)", rivalB: "$429" },
      { spec: "Lenses", product: "Dual (20mm + 60mm)", rivalA: "Dual (20mm + 60mm)", rivalB: "Single (20mm)" },
      { spec: "Max video", product: "8K/30, 4K/120", rivalA: "4K/240", rivalB: "4K/120" },
      { spec: "US availability", product: "Yes", rivalA: "Import only", rivalB: "Yes" },
      { spec: "Screen", product: "Detachable", rivalA: "Fixed", rivalB: "Fixed" },
    ],
  },
};
