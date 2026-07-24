"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryColor } from "../lib/colors";

export default function TopicsNav({ topics }: { topics: string[] }) {
  const pathname = usePathname();

  return (
    <nav className="topics-nav">
      <Link href="/" className="topic-pill" data-active={pathname === "/"}>
        All
      </Link>
      {topics.map((topic) => {
        const href = `/topics/${encodeURIComponent(topic)}`;
        const active = pathname === href || pathname === `/topics/${topic}`;
        const color = categoryColor(topic);
        return (
          <Link
            key={topic}
            href={href}
            className="topic-pill"
            data-active={active}
            style={{ "--pill-color": color } as React.CSSProperties}
          >
            {topic}
          </Link>
        );
      })}
    </nav>
  );
}
