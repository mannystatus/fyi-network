import { headers } from "next/headers";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  const h = await headers();
  const brandSlug = h.get("x-brand-slug") || "fyimac";
  const filePath = path.join(process.cwd(), "public", "icons", `${brandSlug}-512.png`);
  const data = await readFile(filePath);
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": "image/png" },
  });
}
