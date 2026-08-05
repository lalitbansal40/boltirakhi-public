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
    // Eight, not four. A shop's home page is a shop window, and four rakhis
    // above the fold reads as a shop that has almost nothing in it.
    getProducts({ limit: 8 }).catch(() => null),
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
    ? await getProducts({ category: second.slug, limit: 8 }).catch(() => null)
    : null;

  // Whatever the first row already showed should not appear again below it.
  const featuredSlugs = new Set((featured?.items ?? []).map((p) => p.slug));
  const secondItems = (secondRow?.items ?? []).filter((p) => !featuredSlugs.has(p.slug));

  return (
    <>
      <Hero featuredCategory={second} />

      {/*
        Rakhis first, before the category tiles.
        On a phone the tiles used to sit between the hero and the first rakhi,
        so the whole first screen after the headline was a row of words. People
        came to look at rakhis; this shows them rakhis.
      */}
      {featured && featured.items.length > 0 && (
        <ProductSection
          title="Featured this season"
          href="/rakhi"
          // Counted, never written in. "See all 15" would still say 15 the day
          // the twentieth rakhi went up.
          linkLabel={`See all ${featured.total} rakhis`}
          products={featured.items}
        />
      )}

      {categories && categories.length > 0 && <CategoryTiles categories={categories} />}

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
