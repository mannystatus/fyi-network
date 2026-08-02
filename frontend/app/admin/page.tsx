"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_AUTHOR = "Manny Contreras";
const ADMIN_KEY_STORAGE = "fyi-admin-key";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

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

type Scope = {
  is_superadmin: boolean;
  brand_slugs: string[];
  label: string | null;
};

type AdminKeyRow = {
  id: number;
  label: string;
  key_prefix: string;
  brand_slugs: string[];
  is_revoked: boolean;
  created_at: string;
};

type AdminAccessLogRow = {
  id: number;
  ip: string;
  city: string | null;
  region: string | null;
  country: string | null;
  is_superadmin: boolean;
  key_label: string | null;
  occurred_at: string;
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

// Shared by every authenticated call below (article publish/delete, brand
// banner PATCH, and all the key-management endpoints) — one place for the
// 401/503 messages instead of repeating them at each call site. A 403
// (e.g. a scoped key posting to a brand outside its scope) falls through
// to the generic branch, which already surfaces the backend's own
// human-readable `detail` message.
async function adminFetch(path: string, adminKey: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), "X-Admin-Key": adminKey },
  });

  if (res.status === 401) throw new Error("Invalid admin key.");
  if (res.status === 503) throw new Error("The backend has no ADMIN_API_KEY configured — set one in backend/.env and restart it.");
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ? String(detail.detail) : `Request failed (${res.status})`);
  }
  return res;
}

export default function AdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  const [adminKey, setAdminKey] = useState("");
  const [scope, setScope] = useState<Scope | null>(null);
  const [scopeChecking, setScopeChecking] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  const [title, setTitle] = useState("");
  const [dek, setDek] = useState("");
  const [category, setCategory] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [author, setAuthor] = useState(DEFAULT_AUTHOR);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const [bodyImageError, setBodyImageError] = useState<string | null>(null);
  const [bodyDropActive, setBodyDropActive] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<CreateResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [bannerBrandSlug, setBannerBrandSlug] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSaved, setBannerSaved] = useState(false);

  const [keys, setKeys] = useState<AdminKeyRow[]>([]);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyBrandSlugs, setNewKeyBrandSlugs] = useState<Set<string>>(new Set());
  const [creatingKey, setCreatingKey] = useState(false);
  const [createKeyError, setCreateKeyError] = useState<string | null>(null);
  const [justCreatedKey, setJustCreatedKey] = useState<{ label: string; key: string } | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const [accessLog, setAccessLog] = useState<AdminAccessLogRow[]>([]);
  const [accessLogError, setAccessLogError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
    if (saved) {
      setAdminKey(saved);
      // With Turnstile configured, wait for a token before calling
      // whoami — the effect below re-triggers this once one arrives.
      // Widget resolution is normally near-instant, so this is a brief
      // delay rather than requiring a second manual click.
      if (!TURNSTILE_SITE_KEY) verifyKey(saved);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renders the Turnstile widget once its script has loaded — separate from
  // the mount effect above since the script loads async and this must wait
  // for it, not fire immediately on mount.
  useEffect(() => {
    if (!turnstileReady || !TURNSTILE_SITE_KEY || !turnstileRef.current || turnstileWidgetId.current) return;
    turnstileWidgetId.current = window.turnstile!.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": () => setTurnstileToken(null),
    });
  }, [turnstileReady]);

  // Covers both the saved-key auto-login path (verifyKey was skipped above
  // until a token existed) and manual entry finished before the widget
  // resolves — either way, once a token shows up and there's a key typed
  // in, go ahead and verify.
  useEffect(() => {
    if (TURNSTILE_SITE_KEY && turnstileToken && adminKey.trim() && !scope && !scopeChecking) {
      verifyKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnstileToken]);

  async function fetchKeys(key: string) {
    setKeysError(null);
    try {
      const res = await adminFetch("/api/admin/keys", key);
      setKeys(await res.json());
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Couldn't load keys.");
    }
  }

  async function fetchAccessLog(key: string) {
    setAccessLogError(null);
    try {
      const res = await adminFetch("/api/admin/access-log", key);
      setAccessLog(await res.json());
    } catch (err) {
      setAccessLogError(err instanceof Error ? err.message : "Couldn't load the access log.");
    }
  }

  async function verifyKey(keyOverride?: string) {
    const key = (keyOverride ?? adminKey).trim();
    if (!key) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) return;
    setScopeChecking(true);
    setScopeError(null);
    try {
      const res = await adminFetch("/api/admin/whoami", key, {
        headers: turnstileToken ? { "CF-Turnstile-Response": turnstileToken } : undefined,
      });
      const data: Scope = await res.json();
      setScope(data);
      window.localStorage.setItem(ADMIN_KEY_STORAGE, key);
      // Only set it the first time — don't clobber something they've
      // already typed if they re-verify later in the same session.
      if (!data.is_superadmin && data.label && author === DEFAULT_AUTHOR) {
        setAuthor(data.label);
      }
      if (data.is_superadmin) {
        fetchKeys(key);
        fetchAccessLog(key);
      }
    } catch (err) {
      setScope(null);
      setScopeError(err instanceof Error ? err.message : "Couldn't verify key.");
    } finally {
      setScopeChecking(false);
    }
  }

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

  // Shared by the file-input button, drag-and-drop, and clipboard paste —
  // all three just need to get a File in front of this. Alt text is asked
  // up front via a blocking prompt rather than a separate inline field:
  // simplest thing that gets real alt text into the markdown without having
  // to track and re-edit a specific `![...]()` substring inside bodyMd
  // later if the caption changed.
  async function insertBodyImage(file: File) {
    const alt = window.prompt("Alt text for this image (optional, for accessibility/SEO):", "") ?? "";
    setBodyImageError(null);
    setBodyImageUploading(true);
    try {
      const url = await uploadImage(file, adminKey);
      const markdown = `![${alt}](${url})`;
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
    }
  }

  function handleBodyImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) insertBodyImage(file);
  }

  function handleBodyDragOver(e: React.DragEvent<HTMLTextAreaElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setBodyDropActive(true);
  }

  function handleBodyDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    setBodyDropActive(false);
    if (!file) return;
    // A plain <textarea>'s content isn't real DOM text nodes, so there's no
    // reliable cross-browser way to resolve the drop's (x, y) to a caret
    // offset — this inserts at the textarea's current cursor position
    // instead of exactly where the file was visually dropped.
    e.preventDefault();
    insertBodyImage(file);
  }

  function handleBodyPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    const file = item?.getAsFile();
    if (!file) return; // not an image paste — let normal text paste happen
    e.preventDefault();
    insertBodyImage(file);
  }

  async function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !bannerBrandSlug) return;
    setBannerError(null);
    setBannerSaved(false);
    setBannerUploading(true);
    try {
      const url = await uploadImage(file, adminKey);
      const res = await adminFetch(`/api/brands/${bannerBrandSlug}`, adminKey, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: url }),
      });
      const updated: Brand = await res.json();
      setBrands((prev) => prev.map((b) => (b.slug === updated.slug ? updated : b)));
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

  function toggleNewKeyBrand(slug: string) {
    setNewKeyBrandSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleCreateKey() {
    if (!newKeyLabel.trim() || newKeyBrandSlugs.size === 0) {
      setCreateKeyError("Label and at least one site are required.");
      return;
    }
    setCreatingKey(true);
    setCreateKeyError(null);
    try {
      const res = await adminFetch("/api/admin/keys", adminKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newKeyLabel.trim(), brand_slugs: Array.from(newKeyBrandSlugs) }),
      });
      const created: AdminKeyRow & { key: string } = await res.json();
      setJustCreatedKey({ label: created.label, key: created.key });
      setNewKeyLabel("");
      setNewKeyBrandSlugs(new Set());
      fetchKeys(adminKey);
    } catch (err) {
      setCreateKeyError(err instanceof Error ? err.message : "Couldn't create key.");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(id: number) {
    setRevokingId(id);
    try {
      await adminFetch(`/api/admin/keys/${id}/revoke`, adminKey, { method: "POST" });
      fetchKeys(adminKey);
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Couldn't revoke key.");
    } finally {
      setRevokingId(null);
    }
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
      const res = await adminFetch("/api/articles", adminKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const data: CreateResult[] = await res.json();
      setResults(data);
      setImageUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the API — is the backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  const publishableBrands = scope?.is_superadmin ? brands : brands.filter((b) => scope?.brand_slugs.includes(b.slug));

  return (
    <article>
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          onLoad={() => setTurnstileReady(true)}
        />
      )}

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

      <div className="admin-field">
        <label htmlFor="admin-key">Admin key</label>
        <input
          id="admin-key"
          type="password"
          value={adminKey}
          onChange={(e) => {
            setAdminKey(e.target.value);
            setScope(null);
          }}
          placeholder="X-Admin-Key"
          autoComplete="off"
        />
        {TURNSTILE_SITE_KEY && <div ref={turnstileRef} style={{ margin: "10px 0" }} />}
        <button
          type="button"
          onClick={() => verifyKey()}
          disabled={scopeChecking || !adminKey.trim() || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
        >
          {scopeChecking ? "Checking…" : "Verify"}
        </button>
        {scopeError && <p className="admin-error">{scopeError}</p>}
        {scope && (
          <span style={{ fontSize: 12, color: "var(--comment)", display: "block", marginTop: 4 }}>
            {scope.is_superadmin
              ? "Superadmin — full access to every site."
              : `Scoped to: ${scope.brand_slugs.join(", ") || "(none)"}`}
          </span>
        )}
      </div>

      {!scope ? (
        <p style={{ color: "var(--comment)" }}>Enter your admin key and click Verify to continue.</p>
      ) : (
        <>
          {brandsError && <p className="admin-error">{brandsError}</p>}

          {scope.is_superadmin && (
            <>
              <div className="article-header">
                <h2 className="article-title" style={{ fontSize: 20 }}>Site-wide banner</h2>
                <p className="article-dek">
                  Shown at the top of every page on the site you pick below — separate from any individual
                  article&rsquo;s image.
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
                <input
                  id="banner-file"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  disabled={bannerUploading}
                />
                {bannerUploading && <span style={{ fontSize: 12, color: "var(--comment)" }}>Uploading…</span>}
                {bannerSaved && <span style={{ fontSize: 12, color: "var(--comment)" }}>Saved.</span>}
                {bannerError && <p className="admin-error">{bannerError}</p>}
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
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
                onDragOver={handleBodyDragOver}
                onDragLeave={() => setBodyDropActive(false)}
                onDrop={handleBodyDrop}
                onPaste={handleBodyPaste}
                rows={18}
                style={bodyDropActive ? { outline: "2px dashed var(--blue)", outlineOffset: -2 } : undefined}
                placeholder={
                  "## A section heading\n\nBody text, **bold**, *italic*, [links](https://example.com), lists, and " +
                  "GFM tables:\n\n| Col A | Col B |\n| --- | --- |\n| row | row |"
                }
              />
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <label htmlFor="admin-body-image" style={{ fontSize: 12, color: "var(--comment)" }}>
                  Insert image into body (or drag a file / paste one directly into the text above):
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
                {publishableBrands.map((b) => (
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

          {scope.is_superadmin && (
            <>
              <div className="article-header">
                <h2 className="article-title" style={{ fontSize: 20 }}>Contributor keys</h2>
                <p className="article-dek">
                  Issue a key scoped to specific sites — e.g. a Lakers-only writer who can&rsquo;t touch the rest of
                  the network. Shown once at creation; copy it immediately.
                </p>
              </div>

              <div className="admin-field">
                <label htmlFor="new-key-label">Label</label>
                <input
                  id="new-key-label"
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g. Lakers writer"
                />
              </div>

              <div className="admin-field">
                <label>Allowed sites</label>
                <div className="admin-brand-list">
                  {brands.map((b) => (
                    <label key={b.slug} className="admin-brand-chip">
                      <input
                        type="checkbox"
                        checked={newKeyBrandSlugs.has(b.slug)}
                        onChange={() => toggleNewKeyBrand(b.slug)}
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>

              {createKeyError && <p className="admin-error">{createKeyError}</p>}
              <button type="button" onClick={handleCreateKey} disabled={creatingKey}>
                {creatingKey ? "Creating…" : "Create key"}
              </button>

              {justCreatedKey && (
                <div className="admin-results">
                  <strong>{justCreatedKey.label}</strong> — copy this now, it won&rsquo;t be shown again:
                  <pre style={{ userSelect: "all", overflowX: "auto", padding: 8, marginTop: 6 }}>
                    {justCreatedKey.key}
                  </pre>
                </div>
              )}

              <div className="admin-field">
                <label>Existing keys</label>
                {keysError && <p className="admin-error">{keysError}</p>}
                <ul>
                  {keys.map((k) => (
                    <li key={k.id}>
                      <strong>{k.label}</strong> ({k.key_prefix}…) — {k.brand_slugs.join(", ")}
                      {k.is_revoked ? (
                        <span style={{ color: "var(--comment)" }}> — revoked</span>
                      ) : (
                        <button type="button" onClick={() => handleRevokeKey(k.id)} disabled={revokingId === k.id}>
                          {revokingId === k.id ? "Revoking…" : "Revoke"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="article-header">
                <h2 className="article-title" style={{ fontSize: 20 }}>Access log</h2>
                <p className="article-dek">
                  Every successful /admin login, newest first — IP, rough location, and which key was used, so a
                  leaked or shared key&rsquo;s use is visible after the fact.
                </p>
              </div>

              <div className="admin-field">
                {accessLogError && <p className="admin-error">{accessLogError}</p>}
                {accessLog.length === 0 && !accessLogError && (
                  <p style={{ color: "var(--comment)" }}>No logins recorded yet.</p>
                )}
                <ul>
                  {accessLog.map((row) => {
                    const location = [row.city, row.region, row.country].filter(Boolean).join(", ") || "Unknown location";
                    return (
                      <li key={row.id}>
                        {new Date(row.occurred_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" — "}
                        <strong>{row.is_superadmin ? "Superadmin" : row.key_label || "Unknown key"}</strong>
                        {" — "}
                        {row.ip} ({location})
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </article>
  );
}
