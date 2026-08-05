import type { Metadata } from 'next';

import { CheckoutView } from '@/components/checkout/checkout-view';

export const metadata: Metadata = {
  title: 'Checkout',
  // One person's order in progress. robots.ts already disallows /checkout;
  // this repeats it for anything arriving on a direct link.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Checkout</h1>
      <div className="mt-6">
        <CheckoutView />
      </div>
    </div>
  );
}
