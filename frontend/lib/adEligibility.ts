// Every article ingest_news.py auto-generates ends in a "Read the full
// story" outbound link and adds nothing beyond a one-paragraph summary of
// someone else's reporting — exactly what AdSense's "Low value content"
// policy flags (confirmed: fyimac.com got a policy-violation notice citing
// this). Hand-authored pieces (Staff Reviews, buyers guides, etc.) never
// contain this marker, so it doubles as a reliable "is this thin/aggregated"
// check without a dedicated schema field.
export function isAggregatedBrief(bodyMd: string): boolean {
  return bodyMd.includes("Read the full story");
}
