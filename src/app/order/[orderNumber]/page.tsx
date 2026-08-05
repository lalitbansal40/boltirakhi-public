import type { Metadata } from 'next';

import { OrderView } from '@/components/order/order-view';

export const metadata: Metadata = {
  title: 'Your order',
  // One person's order. Nothing here belongs in a search index.
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  // Next 16 hands params over as a Promise.
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <OrderView orderNumber={orderNumber} />
    </div>
  );
}
