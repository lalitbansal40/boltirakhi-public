import { Search } from 'lucide-react';
import type { Metadata } from 'next';

import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/shared/states';
import { searchProducts } from '@/lib/catalog';

type SearchParams = Promise<{ q?: string }>;

/**
 * Search results are for the visitor, not the index — every query would
 * otherwise become its own thin page competing with the real ones.
 */
export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

/** The backend rejects anything shorter, and one letter matches half the shop. */
const MIN_QUERY = 2;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  // Checked here rather than letting the API answer 400: the visitor typed one
  // letter, which is a normal thing to do, not an error to show them.
  const tooShort = query.length > 0 && query.length < MIN_QUERY;
  const results = query.length >= MIN_QUERY ? await searchProducts(query) : null;
  const items = results?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink">
        {query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search'}
      </h1>

      {results && (
        <p className="mt-1 text-sm text-muted">
          {results.total} {results.total === 1 ? 'product' : 'products'}
        </p>
      )}

      <div className="mt-6">
        {!query ? (
          <EmptyState
            icon={Search}
            title="What are you looking for?"
            description="Try a name, a colour, or something like “chocolate combo”."
          />
        ) : tooShort ? (
          <EmptyState
            icon={Search}
            title="A little more to go on"
            description={`Type at least ${MIN_QUERY} letters.`}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`Nothing matched “${query}”`}
            description="Try a shorter word, or browse the categories from the menu."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
