import type { Metadata } from 'next';

import { OrdersList } from '@/components/account/orders-list';
import { getCategories } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Your orders',
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  // Fetched on the server so the empty state has somewhere to send people the
  // moment it renders, rather than after a second round trip.
  const categories = (await getCategories().catch(() => null)) ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Your orders</h1>
      <div className="mt-6">
        <OrdersList categories={categories} />
      </div>
    </div>
  );
}
