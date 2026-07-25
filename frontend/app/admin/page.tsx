"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_AUTHOR = "Manny Contreras";
const ADMIN_KEY_STORAGE = "fyi-admin-key";

type Brand = {
  slug: string;
  name: string;
  domain: string;
  topics: string[];
};

type CreateResult = {
  brand_slug: string;
  status: "created" | "skipped_duplicate" | "brand_not_found";
  article_slug: string | null;
  url: string | null;
};

function slugPreview(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export default function AdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [dek, setDek] = useState("");
  const [category, setCategory] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [author, setAuthor] = useState(DEFAULT_AUTHOR);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adminKey, setAdminKey] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<CreateResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
    if (saved) setAdminKey(saved);

    fetch(`${API_URL}/api/brands`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: Brand[]) => setBrands(data))
      .catch(() => setBrandsError("Couldn't load the brand list from the API — is the backend running?"));
  }, []);

  function toggleBrand(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResults(null);

    if (!title.trim() || !bodyMd.trim()) {
      setError("Title and body are required.");
      return;
    }
    if (selected.size === 0) {
      setError("Pick at least one site to publish to.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({
          title,
          dek: dek.trim() || null,
          category: category.trim() || null,
          body_md: bodyMd,
          author: author.trim() || null,
          brand_slugs: Array.from(selected),
        }),
      });

      if (res.status === 401) {
        setError("Invalid admin key.");
        return;
      }
      if (res.status === 503) {
        setError("The backend has no ADMIN_API_KEY configured — set one in backend/.env and restart it.");
        return;
      }
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        setError(detail?.detail ? JSON.stringify(detail.detail) : `Request failed (${res.status})`);
        return;
      }

      const data: CreateResult[] = await res.json();
      setResults(data);
      window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    } catch {
      setError("Couldn't reach the API — is the backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article>
      <p className="section-label">
        <Link href="/">&larr; Latest</Link>
      </p>

      <div className="article-header">
        <h1 className="article-title">Write a new article</h1>
        <p className="article-dek">
          Publishes straight to the database for whichever sites you pick below. Not linked from anywhere in the
          site nav — bookmark this URL.
        </p>
      </div>

      {brandsError && <p className="admin-error">{brandsError}</p>}

      <form onSubmit={handleSubmit}>
        <div className="admin-field">
          <label htmlFor="admin-key">Admin key</label>
          <input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="X-Admin-Key"
            autoComplete="off"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="admin-title">Title</label>
          <input
            id="admin-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline"
          />
          {title.trim() && (
            <span style={{ fontSize: 12, color: "var(--comment)" }}>URL: /{slugPreview(title)}</span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="admin-dek">Dek (short subhead, optional)</label>
          <input
            id="admin-dek"
            type="text"
            value={dek}
            onChange={(e) => setDek(e.target.value)}
            placeholder="One sentence shown under the headline and in article cards"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="admin-category">Category (optional)</label>
          <input
            id="admin-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Services, Digital Ownership — matches a site's topic pill if it fits one"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="admin-author">Author</label>
          <input id="admin-author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>

        <div className="admin-field">
          <label htmlFor="admin-body">Body (Markdown)</label>
          <textarea
            id="admin-body"
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={18}
            placeholder={"## A section heading\n\nBody text, **bold**, *italic*, [links](https://example.com), lists — no tables (not rendered)."}
          />
        </div>

        <div className="admin-field">
          <label>Publish to</label>
          <div className="admin-brand-list">
            {brands.map((b) => (
              <label key={b.slug} className="admin-brand-chip">
                <input
                  type="checkbox"
                  checked={selected.has(b.slug)}
                  onChange={() => toggleBrand(b.slug)}
                />
                {b.name}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-submit" disabled={submitting}>
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </form>

      {results && (
        <div className="admin-results">
          <strong>Done.</strong>
          <ul>
            {results.map((r) => (
              <li key={r.brand_slug}>
                <strong>{r.brand_slug}</strong>
                {": "}
                {r.status === "created" && r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    published — {r.url}
                  </a>
                )}
                {r.status === "skipped_duplicate" && (
                  <>
                    already existed at this slug —{" "}
                    <a href={r.url ?? "#"} target="_blank" rel="noreferrer">
                      {r.url}
                    </a>
                  </>
                )}
                {r.status === "brand_not_found" && "unknown brand slug"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
