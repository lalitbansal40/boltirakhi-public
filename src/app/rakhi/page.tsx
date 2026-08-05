import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PaginationLinks } from '@/components/catalog/pagination-links';
import { ProductFilters } from '@/components/catalog/product-filters';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/shared/states';
import { getProducts } from '@/lib/catalog';

type Search = Promise<Record<string, string | string[] | undefined>>;

/**
 * Every rakhi, in one place.
 *
 * The shop is split across three categories, so until this page existed the
 * most a visitor could see at once was whichever category happened to be
 * largest — eight of fifteen. There was no "everything" to browse, and the
 * home page's main button pointed at two category slugs that had never been
 * created.
 *
 * This is also the page worth ranking: "rakhi online" belongs here, not on a
 * category that holds a third of the catalogue.
 */
export const metadata: Metadata = {
  title: 'All Rakhis',
  description:
    'Every rakhi we sell, in singles and in packs of 2, 4, 6 and 8. Record a video message and we print a QR code on the packaging.',
};

export default async function Page({ searchParams }: { searchParams: Search }) {
  // Next 16 hands these over as a promise.
  const search = await searchParams;

  const products = await getProducts({
    sort: typeof search.sort === 'string' ? search.sort : undefined,
    minPrice: typeof search.minPrice === 'string' ? Number(search.minPrice) : undefined,
    maxPrice: typeof search.maxPrice === 'string' ? Number(search.maxPrice) : undefined,
    page: typeof search.page === 'string' ? search.page : undefined,
  });

  const items = products?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-brand">All rakhis</h1>
      <p className="mt-2 text-muted">
        Every rakhi we sell. Each one can carry a video message — record it when
        you order, and we print the QR code on the box.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {/* useSearchParams inside makes this client-rendered; without the
            boundary the production build fails even though dev looks fine. */}
        <Suspense fallback={null}>
          <ProductFilters />
        </Suspense>
        {products && (
          <p className="text-sm text-muted">
            {products.total} {products.total === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            title="Nothing matches that"
            description="Try a wider price range."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {products && (
        <PaginationLinks meta={products} searchParams={search} basePath="/rakhi" />
      )}
    </div>
  );
}
