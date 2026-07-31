import type { GuideConfig } from "./buyersGuide";
import { MAC_GUIDE } from "./macBuyersGuide";
import { GOOGLE_GUIDE } from "./googleBuyersGuide";

// Brands without an entry here 404 at /buyers-guide (see app/buyers-guide/page.tsx).
export const BUYERS_GUIDES: Record<string, GuideConfig> = {
  fyimac: MAC_GUIDE,
  fyigoogle: GOOGLE_GUIDE,
};
