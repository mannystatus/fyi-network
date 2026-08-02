"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryColor } from "../lib/colors";

export default function TopicsNav({ topics, extra }: { topics: string[]; extra?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <nav className="topics-nav">
      <div className="topics-nav-scroll">
        <Link href="/" className="topic-link" data-active={pathname === "/"}>
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
              className="topic-link"
              data-active={active}
              style={{ "--pill-color": color } as React.CSSProperties}
            >
              {topic}
            </Link>
          );
        })}
        {extra}
      </div>
    </nav>
  );
}
