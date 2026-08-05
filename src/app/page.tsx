import {
  CategoryTiles,
  Hero,
  HowItWorks,
  ProductSection,
  TrustBar,
} from '@/components/home/sections';
import { getCategories, getProducts } from '@/lib/catalog';

/**
 * A server component, so the catalogue is in the HTML rather than fetched
 * after it. That is what makes the page readable to a crawler and what makes
 * the SEO fields worth having.
 */
export default async function Page() {
  /**
   * Each section is fetched independently and allowed to fail on its own.
   *
   * If the API is down, an empty home page is bad; a home page that will not
   * open at all is worse. A missing section simply does not render.
   */
  const [categories, featured] = await Promise.all([
    getCategories().catch(() => null),
    getProducts({ limit: 4 }).catch(() => null),
  ]);

  /**
   * The second row follows whichever category exists, rather than a slug
   * written into this file.
   *
   * A hardcoded slug here pointed at categories that had never been created,
   * so the section silently never rendered and "View all" led to a 404 — and
   * nothing reported it, because a missing category simply returns nothing.
   */
  const bolti = categories?.find((c) => c.slug === 'bolti-rakhi');
  const second = bolti ?? categories?.[0];

  const secondRow = second
    ? await getProducts({ category: second.slug, limit: 4 }).catch(() => null)
    : null;

  // Whatever the first row already showed should not appear again below it.
  const featuredSlugs = new Set((featured?.items ?? []).map((p) => p.slug));
  const secondItems = (secondRow?.items ?? []).filter((p) => !featuredSlugs.has(p.slug));

  return (
    <>
      <Hero />

      {categories && categories.length > 0 && <CategoryTiles categories={categories} />}

      {featured && featured.items.length > 0 && (
        <ProductSection
          title="Featured this season"
          href={`/rakhi/${categories?.[0]?.slug ?? ''}`}
          products={featured.items}
        />
      )}

      <HowItWorks />

      {second && secondItems.length > 0 && (
        <ProductSection
          title={`More in ${second.name}`}
          href={`/rakhi/${second.slug}`}
          products={secondItems}
        />
      )}

      <TrustBar />
    </>
  );
}
