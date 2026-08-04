/**
 * Stand-in data for Phase 0.
 *
 * Kept in one file rather than inside the components so Phase 2 can delete it
 * in a single step — and so none of it can quietly survive into production
 * hidden inside a section that nobody re-read.
 */
import type { Product } from './types';

export interface NavCategory {
  name: string;
  slug: string;
}

/** Real slugs arrive from the API in Phase 2. */
export const NAV_CATEGORIES: NavCategory[] = [
  { name: 'Bhaiya Bhabhi', slug: 'bhaiya-bhabhi-rakhi' },
  { name: 'Kids', slug: 'kids-rakhi' },
  { name: 'Combo', slug: 'rakhi-combo' },
  { name: 'Chocolates', slug: 'chocolates' },
];

type PlaceholderProduct = Pick<
  Product,
  '_id' | 'title' | 'slug' | 'pricePaise' | 'mrpPaise' | 'images' | 'inStock' | 'type'
>;

function product(
  id: string,
  title: string,
  slug: string,
  pricePaise: number,
  mrpPaise: number,
  type: Product['type'] = 'normal',
): PlaceholderProduct {
  return { _id: id, title, slug, pricePaise, mrpPaise, images: [], inStock: true, type };
}

export const FEATURED_PRODUCTS: PlaceholderProduct[] = [
  product('p1', 'Bhaiya Bhabhi Rakhi Set', 'bhaiya-bhabhi-rakhi-set', 49900, 69900, 'bolti'),
  product('p2', 'Kundan Thread Rakhi', 'kundan-thread-rakhi', 24900, 34900),
  product('p3', 'Kids Cartoon Rakhi', 'kids-cartoon-rakhi', 19900, 24900),
  product('p4', 'Premium Bolti Rakhi', 'premium-bolti-rakhi', 79900, 99900, 'bolti'),
];

export const COMBO_PRODUCTS: PlaceholderProduct[] = [
  product('c1', 'Rakhi with Chocolate Box', 'rakhi-chocolate-box', 59900, 79900),
  product('c2', 'Rakhi and Dry Fruits Hamper', 'rakhi-dry-fruits', 89900, 109900),
  product('c3', 'Two Rakhi Combo with Sweets', 'two-rakhi-sweets', 69900, 84900),
  product('c4', 'Chocolate Gift Basket', 'chocolate-gift-basket', 99900, 129900),
];
