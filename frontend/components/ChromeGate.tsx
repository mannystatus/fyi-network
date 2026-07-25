"use client";

import { usePathname } from "next/navigation";

// template.tsx's headers()-based route check looked right but Next's RSC
// segment-reuse optimization can skip re-executing shared root segments on
// client-side <Link> navigation, so it never actually recomputed after the
// first load (confirmed via real click-through, not just a hard reload).
// usePathname() is a client hook — React re-runs it on every route change,
// which is what TopicsNav already relies on for the same reason.
export default function ChromeGate({
  bare,
  children,
}: {
  bare: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return pathname === "/" ? <>{bare}</> : <>{children}</>;
}
