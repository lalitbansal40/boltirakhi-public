import {
  CategoryTiles,
  Hero,
  HowItWorks,
  ProductSection,
  TrustBar,
} from '@/components/home/sections';
import { COMBO_PRODUCTS, FEATURED_PRODUCTS } from '@/lib/placeholder';

/**
 * Phase 0: the shape of the home page, filled from lib/placeholder.ts.
 * Phase 2 swaps that import for the catalogue API — the sections themselves
 * do not change.
 */
export default function Page() {
  return (
    <>
      <Hero />
      <CategoryTiles />
      <ProductSection
        title="Featured this season"
        href="/rakhi/bhaiya-bhabhi-rakhi"
        products={FEATURED_PRODUCTS}
      />
      <HowItWorks />
      <ProductSection
        title="Combos and chocolates"
        href="/rakhi/rakhi-combo"
        products={COMBO_PRODUCTS}
      />
      <TrustBar />
    </>
  );
}
