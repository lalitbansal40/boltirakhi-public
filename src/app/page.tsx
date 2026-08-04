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
  const [categories, featured, combos] = await Promise.all([
    getCategories().catch(() => null),
    getProducts({ limit: 4 }).catch(() => null),
    getProducts({ category: 'rakhi-combo', limit: 4 }).catch(() => null),
  ]);

  return (
    <>
      <Hero />

      {categories && categories.length > 0 && <CategoryTiles categories={categories} />}

      {featured && featured.items.length > 0 && (
        <ProductSection
          title="Featured this season"
          href="/rakhi/bhaiya-bhabhi-rakhi"
          products={featured.items}
        />
      )}

      <HowItWorks />

      {combos && combos.items.length > 0 && (
        <ProductSection
          title="Combos and chocolates"
          href="/rakhi/rakhi-combo"
          products={combos.items}
        />
      )}

      <TrustBar />
    </>
  );
}
