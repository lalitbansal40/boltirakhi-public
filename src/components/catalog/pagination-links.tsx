import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { Paginated } from '@/lib/types';

/**
 * Real links, not router.push.
 *
 * Page two of a category has to be something a crawler can follow and someone
 * can open in a new tab. A button that pushes history is neither.
 */
export function PaginationLinks({
  meta,
  searchParams,
  basePath,
}: {
  meta: Pick<Paginated<unknown>, 'page' | 'totalPages' | 'hasPrev' | 'hasNext'>;
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  if (meta.totalPages <= 1) return null;

  function hrefFor(page: number): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'page' || value === undefined) continue;
      search.set(key, Array.isArray(value) ? value[0]! : value);
    }
    if (page > 1) search.set('page', String(page));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const linkClass = 'rounded-md border border-line px-3 py-1.5 text-sm hover:bg-accent-soft';
  const mutedClass = 'rounded-md border border-line px-3 py-1.5 text-sm opacity-40';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 py-8">
      {meta.hasPrev ? (
        <Link href={hrefFor(meta.page - 1)} className={linkClass} rel="prev">
          Previous
        </Link>
      ) : (
        <span className={cn(mutedClass)}>Previous</span>
      )}

      <span className="text-sm text-muted">
        Page {meta.page} of {meta.totalPages}
      </span>

      {meta.hasNext ? (
        <Link href={hrefFor(meta.page + 1)} className={linkClass} rel="next">
          Next
        </Link>
      ) : (
        <span className={cn(mutedClass)}>Next</span>
      )}
    </nav>
  );
}
