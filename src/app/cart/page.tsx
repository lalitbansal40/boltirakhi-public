import type { Metadata } from 'next';

import { CartView } from '@/components/cart/cart-view';
import { getCategories } from '@/lib/catalog';

/**
 * A cart is one person's, and it changes every few seconds. There is nothing
 * here for Google to index and nothing that would still be true by the time it
 * crawled. robots.ts already disallows the path; this says the same thing on
 * the page itself, for crawlers that arrive by a direct link.
 */
export const metadata: Metadata = {
  title: 'Your cart',
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  // Fetched on the server so the empty state has somewhere to send people the
  // moment it renders, rather than after a second round trip.
  const categories = (await getCategories().catch(() => null)) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Your cart</h1>
      <div className="mt-6">
        <CartView categories={categories} />
      </div>
    </div>
  );
}
