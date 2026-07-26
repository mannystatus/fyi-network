import Link from "next/link";

export default function Pagination({
  page,
  hasMore,
  basePath,
  query,
}: {
  page: number;
  hasMore: boolean;
  basePath: string;
  query?: string;
}) {
  if (page === 1 && !hasMore) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="pagination-link">
          &larr; Newer
        </Link>
      ) : (
        <span className="pagination-link pagination-disabled">&larr; Newer</span>
      )}
      <span className="pagination-page">Page {page}</span>
      {hasMore ? (
        <Link href={href(page + 1)} className="pagination-link">
          Older &rarr;
        </Link>
      ) : (
        <span className="pagination-link pagination-disabled">Older &rarr;</span>
      )}
    </nav>
  );
}
