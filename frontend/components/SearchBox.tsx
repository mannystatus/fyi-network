"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  return (
    <div className="search-widget" ref={widgetRef}>
      <button
        type="button"
        className="search-trigger"
        aria-label="Search articles"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        🔍
      </button>

      {open && (
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search articles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      )}
    </div>
  );
}
