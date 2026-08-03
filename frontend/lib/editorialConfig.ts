// Per-brand config for the shared "editorial ticker" template (EditorialHeader/
// EditorialHomepage) used by fyiMac, fyiWin, fyiGoogle, fyiNetflix. None of this
// structured content (ticker items, rumor/renewal confidence, compare-table
// rows, update-log/status rows, roadmap rows) has a backend field anywhere —
// same "no schema for this shape" situation fyiCams hit — so it's hand-
// maintained here, one config per brand, transcribed from the provided design
// mockups' own bundled sample data. Real Article data (via the same RSS
// ingestion every brand uses) powers the "Latest news" grid and hero "Top
// stories" rail instead of the mockups' hardcoded sample headlines.

export type ConfidenceRow = { label: string; pct: number; title: string; dek: string };
export type CompareRow = { model: string; col2: string; col3: string; price: string; score: string };
export type LogRow = { name: string; col2: string; date: string; status: string; statusColor: string };
export type RoadmapRow = { window: string; product: string; confidence: string };
export type FantasyRow = { name: string; pos: string; note: string };
export type InjuryRow = {
  name: string;
  pos: string;
  injury: string;
  practice: string;
  status: string;
  statusColor: string;
};

export type EditorialConfig = {
  mode: "light" | "dark";
  signatureMark: "rainbow" | "fourbar" | null;
  navSecondaryLabel: string;
  navLastLabel: string;
  // Explicit nav override — only fyiLakers/fyiDodgers need this (their nav
  // is News/Rumors/Fantasy/Schedule/Injury Report, not the
  // News/Rumors/Reviews/Compare?/Deals shape every other brand shares).
  // Everyone else falls back to the auto-assembled nav in EditorialHeader.
  navItems?: { label: string; href: string }[];
  // Appended after the auto-assembled (or explicit) nav above — currently
  // only fyiMac, promoting Apple TV+/Services out of the topic-pill row
  // into the primary nav. EditorialHeader also filters these labels out of
  // the topic pills it renders from brand.topics, so they don't show twice.
  extraNavItems?: { label: string; href: string }[];
  heroEyebrow: string;
  heroPre: string; // "Every Apple story worth "
  heroPost: string; // " attention, verified before it trends."
  heroDek: string;
  heroCtaLabel?: string; // defaults to "Read today's roundup"
  newsGridTitle: string;
  newsGridCta: string;
  posterAspect: string;
  secondarySectionTitle: string;
  secondarySectionCta: string;
  confidenceRows: ConfidenceRow[];
  showCompare: boolean;
  compareCol2Label: string;
  compareCol3Label: string;
  compareRows: CompareRow[];
  logTitle: string;
  logSubLabel: string;
  logCol1Label: string;
  logCol2Label: string;
  logRows: LogRow[];
  roadmapTitle: string;
  roadmapCta: string;
  roadmapRows: RoadmapRow[];
  roadmapConfidenceSuffix: boolean;
  disclaimer: string;
  networkLinks: string[];
  ticker: { tag: string; text: string }[];

  // Sports-brand variant (fyiLakers/fyiDodgers): Fantasy Corner + Injury
  // Report + the real live-data scoreboard replace Quick Compare/Update
  // Log/Roadmap entirely — see EditorialHomepage.tsx's variant branch.
  variant?: "sports";
  scoreboardBrand?: "lakers" | "dodgers";
  gameDayTeamName?: string; // "fyiLakers" | "fyiDodgers", for GameDaySoftPrompt
  fantasyLabel?: string; // "This week"
  fantasyStart?: FantasyRow[];
  fantasySit?: FantasyRow[];
  injuryUpdatedLabel?: string; // "Updated Fri 4:00pm PT"
  injuryRows?: InjuryRow[];
};

export const MAC_EDITORIAL: EditorialConfig = {
  mode: "light",
  signatureMark: "rainbow",
  navSecondaryLabel: "Rumors",
  navLastLabel: "Deals",
  extraNavItems: [{ label: "Apple TV+", href: `/topics/${encodeURIComponent("Apple TV+")}` }],
  heroEyebrow: "Updated every morning",
  heroPre: "Every Apple story worth ",
  heroPost: " attention, verified before it trends.",
  heroDek: "Mac, iPhone, and iPad news, supply-chain rumors, and buying guides — no spec-sheet paraphrasing.",
  newsGridTitle: "Latest news",
  newsGridCta: "View all →",
  posterAspect: "4/3",
  secondarySectionTitle: "Rumors",
  secondarySectionCta: "Track record →",
  confidenceRows: [
    {
      label: "High confidence",
      pct: 80,
      title: "Redesigned laptop expected before year-end",
      dek: "Two independent supply-chain sources point to the same window.",
    },
    {
      label: "Medium confidence",
      pct: 52,
      title: "Entry tablet may drop the physical button entirely",
      dek: "Would be a first for this product line.",
    },
    {
      label: "Low confidence",
      pct: 30,
      title: "Rumored dual-chip variant still unconfirmed officially",
      dek: "Filing exists, but nothing from official channels yet.",
    },
  ],
  showCompare: true,
  compareCol2Label: "Chip",
  compareCol3Label: "RAM",
  compareRows: [
    { model: 'Pro laptop 14"', col2: "M-series Pro", col3: "32GB", price: "$2,399", score: "8.9" },
    { model: 'Air laptop 13"', col2: "M-series", col3: "16GB", price: "$1,199", score: "8.6" },
    { model: "Entry tablet", col2: "A-series", col3: "8GB", price: "$599", score: "7.8" },
  ],
  logTitle: "Software update log",
  logSubLabel: "macOS · iOS · iPadOS",
  logCol1Label: "Update",
  logCol2Label: "Version",
  logRows: [
    { name: "Desktop OS 15.2", col2: "15.2", date: "Jul 14, 2026", status: "Stable", statusColor: "#2E7D4F" },
    { name: "Phone OS 19.1 beta 3", col2: "19.1b3", date: "Jul 28, 2026", status: "Beta", statusColor: "#C6841F" },
    { name: "Tablet OS 19.0.1", col2: "19.0.1", date: "Jul 2, 2026", status: "Critical", statusColor: "#B3261E" },
    { name: "Watch OS 12.1", col2: "12.1", date: "Jun 20, 2026", status: "Stable", statusColor: "#2E7D4F" },
  ],
  roadmapTitle: "Release roadmap",
  roadmapCta: "Full roadmap →",
  roadmapRows: [
    { window: "Q4 2026", product: "Redesigned laptop line", confidence: "High" },
    { window: "Q1 2027", product: "Next tablet refresh", confidence: "Medium" },
    { window: "Q2 2027", product: "New chip generation", confidence: "High" },
    { window: "Q3 2027", product: "Foldable device (unconfirmed)", confidence: "Low" },
  ],
  roadmapConfidenceSuffix: true,
  disclaimer: "Not affiliated with Apple Inc.",
  networkLinks: ["fyiWin", "fyiGoogle", "fyiNetflix", "fyiFlyNow", "fyiLakers", "fyiDodgers", "fyiCams"],
  ticker: [
    { tag: "Rumor", text: "Next-gen chip said to enter mass production this quarter" },
    { tag: "Software", text: "Latest OS update fixes battery drain bug on older models" },
    { tag: "Price Drop", text: "Entry laptop down 12% at major retailers" },
    { tag: "Rumor", text: "Redesigned tablet spotted in regulatory filing" },
  ],
};

export const WIN_EDITORIAL: EditorialConfig = {
  mode: "light",
  signatureMark: "fourbar",
  navSecondaryLabel: "Rumors",
  navLastLabel: "Deals",
  heroEyebrow: "Updated every morning",
  heroPre: "Every Windows story worth ",
  heroPost: " attention, verified before it trends.",
  heroDek: "PC hardware, OS updates, and buying guides — no spec-sheet paraphrasing.",
  newsGridTitle: "Latest news",
  newsGridCta: "View all →",
  posterAspect: "4/3",
  secondarySectionTitle: "Rumors",
  secondarySectionCta: "Track record →",
  confidenceRows: [
    {
      label: "High confidence",
      pct: 76,
      title: "Major UI refresh expected before year-end",
      dek: "Two independent sources point to the same release window.",
    },
    {
      label: "Medium confidence",
      pct: 49,
      title: "Entry laptops may drop the fingerprint reader entirely",
      dek: "Would be a first for this product tier.",
    },
    {
      label: "Low confidence",
      pct: 27,
      title: "Rumored ARM-native gaming push still unconfirmed",
      dek: "Filing exists, but nothing from official channels yet.",
    },
  ],
  showCompare: true,
  compareCol2Label: "CPU",
  compareCol3Label: "RAM",
  compareRows: [
    { model: 'Pro laptop 14"', col2: "8-core, 4.8GHz", col3: "32GB", price: "$1,899", score: "8.7" },
    { model: 'Ultrabook 13"', col2: "6-core, 4.2GHz", col3: "16GB", price: "$999", score: "8.3" },
    { model: "Budget 2-in-1", col2: "4-core, 3.6GHz", col3: "8GB", price: "$549", score: "7.6" },
  ],
  logTitle: "Windows Update log",
  logSubLabel: "Patch Tuesday tracker",
  logCol1Label: "Update",
  logCol2Label: "KB",
  logRows: [
    { name: "Feature Update 26H1", col2: "KB5041288", date: "Jul 14, 2026", status: "Stable", statusColor: "#2E7D4F" },
    { name: "Insider Preview build", col2: "KB5041301", date: "Jul 28, 2026", status: "Beta", statusColor: "#C6841F" },
    { name: "Security patch", col2: "KB5040998", date: "Jul 2, 2026", status: "Critical", statusColor: "#B3261E" },
    { name: "Optional update", col2: "KB5040872", date: "Jun 20, 2026", status: "Optional", statusColor: "#5B6470" },
  ],
  roadmapTitle: "Feature roadmap",
  roadmapCta: "Full roadmap →",
  roadmapRows: [
    { window: "Q4 2026", product: "Redesigned settings app", confidence: "High" },
    { window: "Q1 2027", product: "Native ARM app parity push", confidence: "Medium" },
    { window: "Q2 2027", product: "New taskbar customization options", confidence: "High" },
    { window: "Q3 2027", product: "Handheld gaming mode (unconfirmed)", confidence: "Low" },
  ],
  roadmapConfidenceSuffix: true,
  disclaimer: "Not affiliated with Microsoft Corporation.",
  networkLinks: ["fyiMac", "fyiGoogle", "fyiNetflix", "fyiFlyNow", "fyiLakers", "fyiDodgers", "fyiCams"],
  ticker: [
    { tag: "Rumor", text: "Next OS feature update said to enter broad rollout next month" },
    { tag: "Update", text: "Latest cumulative update fixes a printer driver bug" },
    { tag: "Price Drop", text: "Popular ultrabook down 15% at major retailers" },
    { tag: "Rumor", text: "New handheld gaming device spotted in FCC filing" },
  ],
};

export const GOOGLE_EDITORIAL: EditorialConfig = {
  mode: "light",
  signatureMark: null,
  navSecondaryLabel: "Rumors",
  navLastLabel: "Deals",
  heroEyebrow: "Updated every morning",
  heroPre: "Every Google story worth ",
  heroPost: " attention, verified before it trends.",
  heroDek: "Pixel, Android, and Chrome news, rumors, and buying guides — no spec-sheet paraphrasing.",
  newsGridTitle: "Latest news",
  newsGridCta: "View all →",
  posterAspect: "4/3",
  secondarySectionTitle: "Rumors",
  secondarySectionCta: "Track record →",
  confidenceRows: [
    {
      label: "High confidence",
      pct: 79,
      title: "Next flagship Pixel expected before year-end",
      dek: "Two independent supply-chain sources point to the same window.",
    },
    {
      label: "Medium confidence",
      pct: 51,
      title: "Budget Pixel may drop the physical SIM slot entirely",
      dek: "Would be a first for this product line.",
    },
    {
      label: "Low confidence",
      pct: 29,
      title: "Rumored tablet successor still unconfirmed officially",
      dek: "Filing exists, but nothing from official channels yet.",
    },
  ],
  showCompare: true,
  compareCol2Label: "Chip",
  compareCol3Label: "RAM",
  compareRows: [
    { model: "Pixel Pro", col2: "Tensor-series", col3: "12GB", price: "$999", score: "8.8" },
    { model: "Pixel (standard)", col2: "Tensor-series", col3: "8GB", price: "$699", score: "8.4" },
    { model: "Pixel A-series", col2: "Tensor-series", col3: "8GB", price: "$499", score: "8.0" },
  ],
  logTitle: "Software update log",
  logSubLabel: "Android · Chrome · Wear OS",
  logCol1Label: "Update",
  logCol2Label: "Version",
  logRows: [
    { name: "Android 16 QPR2", col2: "16.2", date: "Jul 14, 2026", status: "Stable", statusColor: "#2E7D4F" },
    { name: "Android 17 beta 1", col2: "17b1", date: "Jul 28, 2026", status: "Beta", statusColor: "#C6841F" },
    { name: "Pixel Feature Drop", col2: "2026.07", date: "Jul 2, 2026", status: "Stable", statusColor: "#2E7D4F" },
    { name: "Chrome security patch", col2: "128.0.1", date: "Jun 20, 2026", status: "Critical", statusColor: "#B3261E" },
  ],
  roadmapTitle: "Release roadmap",
  roadmapCta: "Full roadmap →",
  roadmapRows: [
    { window: "Q4 2026", product: "Next flagship Pixel", confidence: "High" },
    { window: "Q1 2027", product: "Foldable Pixel refresh", confidence: "Medium" },
    { window: "Q2 2027", product: "Next Tensor chip generation", confidence: "High" },
    { window: "Q3 2027", product: "Pixel tablet successor (unconfirmed)", confidence: "Low" },
  ],
  roadmapConfidenceSuffix: true,
  disclaimer: "Not affiliated with Google LLC.",
  networkLinks: ["fyiMac", "fyiWin", "fyiNetflix", "fyiFlyNow", "fyiLakers", "fyiDodgers", "fyiCams"],
  ticker: [
    { tag: "Rumor", text: "Next Pixel chip said to enter mass production this quarter" },
    { tag: "Update", text: "Latest Android release fixes a notification bug" },
    { tag: "Price Drop", text: "Popular Pixel phone down 20% at major retailers" },
    { tag: "Rumor", text: "Foldable successor spotted in regulatory filing" },
  ],
};

export const NETFLIX_EDITORIAL: EditorialConfig = {
  mode: "dark",
  signatureMark: null,
  navSecondaryLabel: "Renewal Tracker",
  navLastLabel: "New This Week",
  heroEyebrow: "Updated every morning",
  heroPre: "Every Netflix story worth ",
  heroPost: " attention, verified before it trends.",
  heroDek: "Renewal odds, new releases, and what's leaving — tracked daily, no clickbait required.",
  newsGridTitle: "New this week",
  newsGridCta: "Full calendar →",
  posterAspect: "2/3",
  secondarySectionTitle: "Renewal tracker",
  secondarySectionCta: "Track record →",
  confidenceRows: [
    {
      label: "High confidence",
      pct: 83,
      title: "Breakout drama likely renewed for a third season",
      dek: "Viewership data and cast social activity both point the same way.",
    },
    {
      label: "Medium confidence",
      pct: 46,
      title: "Freshman comedy on the bubble ahead of the fall slate review",
      dek: "Retention numbers were mixed after a strong series premiere.",
    },
    {
      label: "Low confidence",
      pct: 22,
      title: "Spin-off speculation remains unconfirmed by the studio",
      dek: "No official comment as of this week.",
    },
  ],
  showCompare: false,
  compareCol2Label: "",
  compareCol3Label: "",
  compareRows: [],
  logTitle: "Show status tracker",
  logSubLabel: "Updated weekly",
  logCol1Label: "Title",
  logCol2Label: "Genre",
  logRows: [
    { name: "Breakout Drama", col2: "Thriller", date: "Aug 1, 2026", status: "Renewed", statusColor: "#2E7D4F" },
    { name: "Freshman Comedy", col2: "Comedy", date: "Jul 24, 2026", status: "Pending", statusColor: "#C6841F" },
    { name: "Limited Series X", col2: "Drama", date: "Jul 18, 2026", status: "Cancelled", statusColor: "#B3261E" },
    { name: "Long-Running Procedural", col2: "Crime", date: "Jul 10, 2026", status: "Renewed", statusColor: "#2E7D4F" },
  ],
  roadmapTitle: "Coming this month",
  roadmapCta: "Full calendar →",
  roadmapRows: [
    { window: "Week 1", product: "Season premiere: breakout drama", confidence: "Confirmed" },
    { window: "Week 2", product: "New original film wide release", confidence: "Confirmed" },
    { window: "Week 3", product: "Docuseries finale", confidence: "Confirmed" },
    { window: "Week 4", product: "Surprise drop (unconfirmed title)", confidence: "Rumored" },
  ],
  roadmapConfidenceSuffix: false,
  disclaimer: "Not affiliated with Netflix, Inc.",
  networkLinks: ["fyiMac", "fyiWin", "fyiGoogle", "fyiFlyNow", "fyiLakers", "fyiDodgers", "fyiCams"],
  ticker: [
    { tag: "Renewal", text: "Breakout drama said to be a strong bet for a season 3 renewal" },
    { tag: "Leaving", text: "Fan-favorite comedy leaving the platform at month's end" },
    { tag: "New", text: "Surprise limited series drop lands three weeks early" },
    { tag: "Cancelled", text: "Freshman series axed after one season, sources confirm" },
  ],
};

export const LAKERS_EDITORIAL: EditorialConfig = {
  mode: "light",
  signatureMark: null,
  navSecondaryLabel: "Rumors",
  navLastLabel: "Injury Report",
  navItems: [
    { label: "News", href: "/" },
    { label: "Rumors", href: "/#rumor-mill" },
    { label: "Fantasy", href: "/#fantasy" },
    { label: "Schedule", href: "/#scoreboard" },
    { label: "Injury Report", href: "/#injury-report" },
  ],
  heroEyebrow: "Updated daily through the season",
  heroPre: "Lakers beat writers break it down ",
  heroPost: " before the highlight shows do",
  heroDek: "Trade rumors, roster moves, and fantasy implications — reported straight, no hot takes required.",
  heroCtaLabel: "Read today's report",
  newsGridTitle: "Latest news",
  newsGridCta: "View all →",
  posterAspect: "4/3",
  secondarySectionTitle: "Rumors",
  secondarySectionCta: "Track record →",
  confidenceRows: [
    {
      label: "High confidence",
      pct: 80,
      title: "Front office gauging trade interest before the deadline",
      dek: "Two independent league sources describe active, ongoing calls.",
    },
    {
      label: "Medium confidence",
      pct: 50,
      title: "Rotation may shift toward a smaller lineup down the stretch",
      dek: "Minutes distribution has trended this way for two weeks.",
    },
    {
      label: "Low confidence",
      pct: 30,
      title: "Speculation about a coaching change remains unconfirmed",
      dek: "No official comment from the organization as of Friday.",
    },
  ],
  showCompare: false,
  compareCol2Label: "",
  compareCol3Label: "",
  compareRows: [],
  logTitle: "",
  logSubLabel: "",
  logCol1Label: "",
  logCol2Label: "",
  logRows: [],
  roadmapTitle: "",
  roadmapCta: "",
  roadmapRows: [],
  roadmapConfidenceSuffix: false,
  disclaimer: "Independent fan coverage — not affiliated with the NBA or the Los Angeles Lakers.",
  networkLinks: ["fyiMac", "fyiWin", "fyiGoogle", "fyiNetflix", "fyiFlyNow", "fyiDodgers", "fyiCams"],
  ticker: [
    { tag: "Rumor", text: "Front office reportedly gauging trade interest before the deadline" },
    { tag: "Injury", text: "Starting guard listed questionable with sore knee" },
    { tag: "Roster", text: "Two-way wing signed to a standard contract" },
    { tag: "Fantasy", text: "Bench big trending up with expanded rotation minutes" },
    { tag: "Rumor", text: "Coaching staff denies report of rotation shake-up" },
  ],
  variant: "sports",
  scoreboardBrand: "lakers",
  gameDayTeamName: "fyiLakers",
  fantasyLabel: "This week",
  fantasyStart: [
    { name: "Bench big", pos: "C", note: "Minutes up" },
    { name: "Two-way wing", pos: "F", note: "Favorable pace" },
    { name: "Backup guard", pos: "G", note: "Expanded role" },
  ],
  fantasySit: [
    { name: "Starting wing", pos: "F", note: "Tough matchup" },
    { name: "Rookie guard", pos: "G", note: "Limited minutes" },
    { name: "Veteran big", pos: "C", note: "Load management" },
  ],
  injuryUpdatedLabel: "Updated Fri 4:00pm PT",
  injuryRows: [
    { name: "Starting guard", pos: "G", injury: "Knee soreness", practice: "Limited", status: "Questionable", statusColor: "#C6841F" },
    { name: "Starting forward", pos: "F", injury: "Ankle", practice: "Full", status: "Active", statusColor: "#2E7D4F" },
    { name: "Backup center", pos: "C", injury: "Rest", practice: "DNP", status: "Load management", statusColor: "#C6841F" },
    { name: "Two-way wing", pos: "F", injury: "Hamstring", practice: "DNP", status: "Out", statusColor: "#B3261E" },
  ],
};

export const DODGERS_EDITORIAL: EditorialConfig = {
  mode: "light",
  signatureMark: null,
  navSecondaryLabel: "Rumors",
  navLastLabel: "Injury Report",
  navItems: [
    { label: "News", href: "/" },
    { label: "Rumors", href: "/#rumor-mill" },
    { label: "Fantasy", href: "/#fantasy" },
    { label: "Schedule", href: "/#scoreboard" },
    { label: "Injury Report", href: "/#injury-report" },
  ],
  heroEyebrow: "Updated daily through the season",
  heroPre: "Dodgers beat writers break it down ",
  heroPost: " before the highlight shows do",
  heroDek: "Trade rumors, roster moves, and fantasy implications — reported straight, no hot takes required.",
  heroCtaLabel: "Read today's report",
  newsGridTitle: "Latest news",
  newsGridCta: "View all →",
  posterAspect: "4/3",
  secondarySectionTitle: "Rumors",
  secondarySectionCta: "Track record →",
  confidenceRows: [
    {
      label: "High confidence",
      pct: 75,
      title: "Front office scouting bullpen arms ahead of the deadline",
      dek: "Two independent league sources describe active, ongoing calls.",
    },
    {
      label: "Medium confidence",
      pct: 48,
      title: "Team may shift closer duties down the stretch",
      dek: "Usage pattern has trended this way over the last two weeks.",
    },
    {
      label: "Low confidence",
      pct: 24,
      title: "Speculation about a lineup shakeup remains unconfirmed",
      dek: "No official comment from the organization as of Friday.",
    },
  ],
  showCompare: false,
  compareCol2Label: "",
  compareCol3Label: "",
  compareRows: [],
  logTitle: "",
  logSubLabel: "",
  logCol1Label: "",
  logCol2Label: "",
  logRows: [],
  roadmapTitle: "",
  roadmapCta: "",
  roadmapRows: [],
  roadmapConfidenceSuffix: false,
  disclaimer: "Independent fan coverage — not affiliated with MLB or the Los Angeles Dodgers.",
  networkLinks: ["fyiMac", "fyiWin", "fyiGoogle", "fyiNetflix", "fyiFlyNow", "fyiLakers", "fyiCams"],
  ticker: [
    { tag: "Rumor", text: "Front office reportedly scouting bullpen arms ahead of deadline" },
    { tag: "Injury", text: "Starting outfielder day-to-day with tight hamstring" },
    { tag: "Roster", text: "Top pitching prospect called up from Triple-A" },
    { tag: "Fantasy", text: "Cleanup hitter trending up after lineup shakeup" },
    { tag: "Rumor", text: "Front office denies report of clubhouse tension" },
  ],
  variant: "sports",
  scoreboardBrand: "dodgers",
  gameDayTeamName: "fyiDodgers",
  fantasyLabel: "This week",
  fantasyStart: [
    { name: "Leadoff hitter", pos: "OF", note: "Hot streak" },
    { name: "Backup 1B", pos: "1B", note: "Platoon edge" },
    { name: "Setup reliever", pos: "RP", note: "High leverage" },
  ],
  fantasySit: [
    { name: "Rookie 3B", pos: "3B", note: "Tough matchup" },
    { name: "Bench OF", pos: "OF", note: "Limited at-bats" },
    { name: "Long reliever", pos: "RP", note: "Low usage" },
  ],
  injuryUpdatedLabel: "Updated Fri 4:00pm PT",
  injuryRows: [
    { name: "Starting OF", pos: "OF", injury: "Hamstring", practice: "Day-to-day", status: "Probable", statusColor: "#2E7D4F" },
    { name: "Starting SS", pos: "SS", injury: "Wrist", practice: "Limited", status: "Questionable", statusColor: "#C6841F" },
    { name: "Setup RP", pos: "RP", injury: "Shoulder fatigue", practice: "Rest day", status: "Available", statusColor: "#2E7D4F" },
    { name: "Backup C", pos: "C", injury: "Concussion protocol", practice: "DNP", status: "Out", statusColor: "#B3261E" },
  ],
};

export const EDITORIAL_CONFIGS: Record<string, EditorialConfig> = {
  mac: MAC_EDITORIAL,
  win: WIN_EDITORIAL,
  google: GOOGLE_EDITORIAL,
  netflix: NETFLIX_EDITORIAL,
  lakers: LAKERS_EDITORIAL,
  dodgers: DODGERS_EDITORIAL,
};
