// Hardcoded v1 content for CamsHomepage's non-article sections (quick
// compare, video reviews, deals). None of these content shapes exist in
// the backend yet — see the add-brand plan's backend-scope note — so this
// is hand-maintained config for now, same pattern as buyersGuideRegistry.ts.
// The rumor mill widget used to live here too but now reads real ingested
// Rumors-category articles (see CamsHomepage.tsx) instead of fake copy.

export const COMPARE_ROWS = [
  { model: "Flagship Mirrorless X2", sensor: "Full-frame 45MP", burst: "20 fps", price: "$3,199", score: "8.9" },
  { model: "Enthusiast APS-C R5", sensor: "APS-C 26MP", burst: "15 fps", price: "$1,499", score: "8.2" },
  { model: "Compact Travel Z", sensor: "1-inch 20MP", burst: "10 fps", price: "$899", score: "7.4" },
];

export const VIDEO_REVIEWS = [
  { title: "Flagship mirrorless: 30 days as a daily shooter", duration: "14:22", cat: "Video Review" },
  { title: "Budget zoom vs. the prime everyone recommends", duration: "9:47", cat: "Comparison" },
  { title: "Studio lighting on a $300 budget", duration: "11:03", cat: "Tutorial" },
];

export const DEALS = [
  { title: "35mm f/1.4 prime", was: "$899", now: "$729", pct: "-18%" },
  { title: "Entry-level APS-C body + kit lens", was: "$1,099", now: "$949", pct: "-14%" },
  { title: "64GB CFexpress card", was: "$139", now: "$99", pct: "-29%" },
];
