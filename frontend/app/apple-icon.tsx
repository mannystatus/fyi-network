import { headers } from "next/headers";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const h = await headers();
  const brandSlug = h.get("x-brand-slug") || "fyimac";
  const filePath = path.join(process.cwd(), "public", "icons", `${brandSlug}-180.png`);
  const data = await readFile(filePath);
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": "image/png" },
  });
}
