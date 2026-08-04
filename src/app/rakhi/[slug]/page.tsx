import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { PaginationLinks } from '@/components/catalog/pagination-links';
import { ProductFilters } from '@/components/catalog/product-filters';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/shared/states';
import { getCategory, getProducts } from '@/lib/catalog';
import type { Metadata } from 'next';

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug).catch(() => null);
  if (!category) return {};

  // Falls back to the name: not every category will have the SEO fields
  // filled in, and an empty title is the worst outcome of the three.
  return {
    title: category.metaTitle ?? category.name,
    description: category.metaDescription ?? category.description,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  // Next 16 hands both of these over as promises.
  const { slug } = await params;
  const search = await searchParams;

  const category = await getCategory(slug);
  // A retired category should drop out of the index, not linger as a page
  // with nothing on it.
  if (!category) notFound();

  const products = await getProducts({
    category: slug,
    sort: typeof search.sort === 'string' ? search.sort : undefined,
    minPrice: typeof search.minPrice === 'string' ? Number(search.minPrice) : undefined,
    maxPrice: typeof search.maxPrice === 'string' ? Number(search.maxPrice) : undefined,
    page: typeof search.page === 'string' ? search.page : undefined,
  });

  const items = products?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-brand">{category.name}</h1>
      {category.description && <p className="mt-2 text-muted">{category.description}</p>}

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
            title="Nothing here yet"
            description="Try a different price range, or browse another category."
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
        <PaginationLinks meta={products} searchParams={search} basePath={`/rakhi/${slug}`} />
      )}
    </div>
  );
}
