'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Filters live in the URL, never in component state.
 *
 * A filtered listing has to be a link someone can send, a page the back button
 * can return to, and something a crawler can follow. Held in state, it is none
 * of those.
 */

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
] as const;

/** Whole paise, because that is what the API takes. */
const PRICE_BANDS = [
  { value: '', label: 'Any price' },
  { value: '0-29900', label: 'Under ₹300' },
  { value: '30000-59900', label: '₹300 – ₹599' },
  { value: '60000-99900', label: '₹600 – ₹999' },
  { value: '100000-', label: '₹1,000 and above' },
] as const;

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function apply(next: Record<string, string | undefined>) {
    const search = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }

    // Any change to what is being filtered starts again at the first page.
    // Otherwise someone on page five narrows the results and lands on an empty
    // screen that reads as a broken site.
    search.delete('page');

    const query = search.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const band = `${params.get('minPrice') ?? ''}-${params.get('maxPrice') ?? ''}`;
  const currentBand = PRICE_BANDS.some((b) => b.value === band) ? band : '';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">Sort</span>
        <select
          value={params.get('sort') ?? 'newest'}
          onChange={(event) => apply({ sort: event.target.value })}
          className="min-h-11 rounded-md border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">Price</span>
        <select
          value={currentBand}
          onChange={(event) => {
            const [min, max] = event.target.value.split('-');
            apply({ minPrice: min || undefined, maxPrice: max || undefined });
          }}
          className="min-h-11 rounded-md border border-line bg-surface px-3 py-1.5 text-sm transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          {PRICE_BANDS.map((price) => (
            <option key={price.value} value={price.value}>
              {price.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
