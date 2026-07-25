export type FaqItem = { question: string; answer: string };

// Pulls Q&A pairs out of a markdown body's "## Frequently Asked Questions"
// section (### question, followed by its answer paragraph(s)) so the
// FAQPage JSON-LD on the article page always mirrors what's actually
// visible in the rendered article — Google requires the two to match.
export function extractFaq(bodyMd: string): FaqItem[] {
  const lines = bodyMd.split("\n");
  const start = lines.findIndex((l) => /^##\s+Frequently Asked Questions/i.test(l.trim()));
  if (start === -1) return [];

  const items: FaqItem[] = [];
  let current: FaqItem | null = null;

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+/.test(line)) break; // next H2 ends the FAQ block

    const question = line.match(/^###\s+(.+)/);
    if (question) {
      if (current) items.push(current);
      current = { question: question[1].trim(), answer: "" };
      continue;
    }
    if (current && line.trim()) {
      current.answer = current.answer ? `${current.answer} ${line.trim()}` : line.trim();
    }
  }
  if (current) items.push(current);

  return items.filter((i) => i.question && i.answer);
}
