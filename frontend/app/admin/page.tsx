"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_AUTHOR = "Manny Contreras";
const ADMIN_KEY_STORAGE = "fyi-admin-key";

type Brand = {
  slug: string;
  name: string;
  domain: string;
  topics: string[];
  image_url: string | null;
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

async function uploadImage(file: File, adminKey: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: { "X-Admin-Key": adminKey },
    body: form,
  });

  if (res.status === 401) throw new Error("Invalid admin key.");
  if (res.status === 503) throw new Error("The backend has no BLOB_READ_WRITE_TOKEN configured.");
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ? String(detail.detail) : `Upload failed (${res.status})`);
  }

  const data: { url: string } = await res.json();
  return data.url;
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
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const [bodyImageError, setBodyImageError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<CreateResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [bannerBrandSlug, setBannerBrandSlug] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSaved, setBannerSaved] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
    if (saved) setAdminKey(saved);

    fetch(`${API_URL}/api/brands`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: Brand[]) => {
        setBrands(data);
        if (data.length > 0) setBannerBrandSlug(data[0].slug);
      })
      .catch(() => setBrandsError("Couldn't load the brand list from the API — is the backend running?"));
  }, []);

  async function handleArticleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setImageUploading(true);
    try {
      const url = await uploadImage(file, adminKey);
      setImageUrl(url);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleBodyImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBodyImageError(null);
    setBodyImageUploading(true);
    try {
      const url = await uploadImage(file, adminKey);
      const markdown = `![](${url})`;
      const el = bodyRef.current;
      const start = el?.selectionStart ?? bodyMd.length;
      const end = el?.selectionEnd ?? bodyMd.length;
      setBodyMd((prev) => prev.slice(0, start) + markdown + prev.slice(end));
      // Put the cursor right after the inserted markdown, matching what a
      // native paste/insert would do — otherwise it'd stay wherever it was
      // before the textarea's value changed underneath it.
      requestAnimationFrame(() => {
        if (!el) return;
        const cursor = start + markdown.length;
        el.focus();
        el.setSelectionRange(cursor, cursor);
      });
    } catch (err) {
      setBodyImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBodyImageUploading(false);
      e.target.value = "";
    }
  }

  async function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !bannerBrandSlug) return;
    setBannerError(null);
    setBannerSaved(false);
    setBannerUploading(true);
    try {
      const url = await uploadImage(file, adminKey);
      const res = await fetch(`${API_URL}/api/brands/${bannerBrandSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({ image_url: url }),
      });
      if (res.status === 401) throw new Error("Invalid admin key.");
      if (!res.ok) throw new Error(`Save failed (${res.status})`);

      const updated: Brand = await res.json();
      setBrands((prev) => prev.map((b) => (b.slug === updated.slug ? updated : b)));
      window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
      setBannerSaved(true);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBannerUploading(false);
    }
  }

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
          image_url: imageUrl,
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
      setImageUrl(null);
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

      <div className="article-header">
        <h2 className="article-title" style={{ fontSize: 20 }}>Site-wide banner</h2>
        <p className="article-dek">
          Shown at the top of every page on the site you pick below — separate from any individual article&rsquo;s
          image. Uses the admin key further down.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="banner-brand">Site</label>
        <select
          id="banner-brand"
          value={bannerBrandSlug}
          onChange={(e) => {
            setBannerBrandSlug(e.target.value);
            setBannerSaved(false);
            setBannerError(null);
          }}
        >
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {bannerBrandSlug && brands.find((b) => b.slug === bannerBrandSlug)?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brands.find((b) => b.slug === bannerBrandSlug)?.image_url ?? undefined}
          alt="Current site-wide banner"
          style={{ maxWidth: 320, display: "block", marginBottom: 8, borderRadius: 8 }}
        />
      )}

      <div className="admin-field">
        <label htmlFor="banner-file">Upload new header image</label>
        <input id="banner-file" type="file" accept="image/*" onChange={handleBannerFileChange} disabled={bannerUploading} />
        {bannerUploading && <span style={{ fontSize: 12, color: "var(--comment)" }}>Uploading…</span>}
        {bannerSaved && <span style={{ fontSize: 12, color: "var(--comment)" }}>Saved.</span>}
        {bannerError && <p className="admin-error">{bannerError}</p>}
      </div>

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
            ref={bodyRef}
            id="admin-body"
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={18}
            placeholder={
              "## A section heading\n\nBody text, **bold**, *italic*, [links](https://example.com), lists, and " +
              "GFM tables:\n\n| Col A | Col B |\n| --- | --- |\n| row | row |"
            }
          />
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor="admin-body-image" style={{ fontSize: 12, color: "var(--comment)" }}>
              Insert image into body:
            </label>
            <input
              id="admin-body-image"
              type="file"
              accept="image/*"
              onChange={handleBodyImageChange}
              disabled={bodyImageUploading}
            />
            {bodyImageUploading && <span style={{ fontSize: 12, color: "var(--comment)" }}>Uploading…</span>}
          </div>
          {bodyImageError && <p className="admin-error">{bodyImageError}</p>}
        </div>

        <div className="admin-field">
          <label htmlFor="admin-image">This article&rsquo;s image (optional)</label>
          <span style={{ fontSize: 12, color: "var(--comment)", display: "block", marginBottom: 4 }}>
            Shown at the top of this one article only — not the site-wide banner set above.
          </span>
          <input id="admin-image" type="file" accept="image/*" onChange={handleArticleImageChange} disabled={imageUploading} />
          {imageUploading && <span style={{ fontSize: 12, color: "var(--comment)" }}>Uploading…</span>}
          {imageError && <p className="admin-error">{imageError}</p>}
          {imageUrl && !imageUploading && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Article image preview" style={{ maxWidth: 320, display: "block", marginTop: 8, borderRadius: 8 }} />
          )}
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
