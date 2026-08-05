'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { useCart } from '@/components/cart/cart-provider';
import { AddressForm } from '@/components/checkout/address-form';
import { Button } from '@/components/ui/button';
import { listAddresses, type Address } from '@/lib/account-api';
import { formatPaise } from '@/lib/money';

export function CheckoutView() {
  const router = useRouter();
  const { isReady: authReady, isSignedIn } = useAuth();
  const { lines, pricing, isReady: cartReady, couponCode } = useCart();

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  /**
   * Both guards wait for `isReady`.
   *
   * `isReady === false` means "not known yet", not "signed out" and not "cart
   * is empty". Acting on the unknown state sends a signed-in customer with a
   * full cart to the login page on every refresh — and it does it
   * intermittently, which is the hardest kind of bug to be told about.
   *
   * `replace`, not `push`: back should return to where they came from, not
   * bounce them through the redirect again.
   */
  useEffect(() => {
    if (!authReady) return;
    if (!isSignedIn) router.replace('/login?next=/checkout');
  }, [authReady, isSignedIn, router]);

  useEffect(() => {
    if (!cartReady) return;
    if (lines.length === 0) router.replace('/cart');
  }, [cartReady, lines.length, router]);

  useEffect(() => {
    if (!authReady || !isSignedIn) return;

    listAddresses()
      .then((result) => {
        setAddresses(result.addresses);
        // The server already returns the default first, so the head of the
        // list is the right choice — no sorting here.
        setSelectedId(result.addresses[0]?.id ?? null);
        // A customer with no saved address gets the form straight away rather
        // than an empty box and a button to press first.
        setAdding(result.addresses.length === 0);
      })
      .catch(() => {
        setAddresses([]);
        setAdding(true);
      });
  }, [authReady, isSignedIn]);

  if (!authReady || !cartReady || !isSignedIn || lines.length === 0) {
    return <div className="py-16 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Delivery address</h2>

        {addresses === null ? (
          <p className="mt-4 text-muted">Loading your addresses…</p>
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer gap-3 rounded-[var(--radius-card)] border p-3 ${
                  selectedId === address.id ? 'border-brand bg-accent-soft/40' : 'border-line'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === address.id}
                  onChange={() => setSelectedId(address.id)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <p className="font-medium text-ink">
                    {address.name}
                    {address.label && <span className="ml-2 text-muted">({address.label})</span>}
                  </p>
                  <p className="text-muted">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}{' '}
                    {address.pincode}
                  </p>
                  <p className="text-muted">+91 {address.phone.replace(/^(\+?91)/, '')}</p>
                </div>
              </label>
            ))}

            {adding ? (
              <div className="rounded-[var(--radius-card)] border border-line p-4">
                <AddressForm
                  onSaved={(address) => {
                    setAddresses((current) => [...(current ?? []), address]);
                    // Selected immediately: they just typed it, so it is
                    // obviously the one they mean to use.
                    setSelectedId(address.id);
                    setAdding(false);
                  }}
                  onCancel={
                    addresses.length > 0 ? () => setAdding(false) : undefined
                  }
                />
              </div>
            ) : (
              <Button variant="outline" onClick={() => setAdding(true)}>
                <Plus className="size-4" aria-hidden />
                Add a new address
              </Button>
            )}
          </div>
        )}
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <h2 className="font-heading text-lg font-semibold text-ink">Order summary</h2>

          {!pricing ? (
            <p className="mt-4 text-sm text-muted">Working out your total…</p>
          ) : (
            <>
              {/* Straight from /api/cart/price, the same call the cart page
                  makes. Nothing on this page adds anything up. */}
              <dl className="mt-4 space-y-2 text-sm">
                <Row label={`Items (${lines.length})`} value={formatPaise(pricing.subtotalPaise)} />
                <Row
                  label="Delivery"
                  value={
                    pricing.shippingPaise === 0 ? (
                      <span className="font-medium text-brand">FREE</span>
                    ) : (
                      formatPaise(pricing.shippingPaise)
                    )
                  }
                />
                {pricing.discountPaise > 0 && (
                  <Row
                    label={couponCode ? `Coupon (${couponCode})` : 'Discount'}
                    value={<span className="text-brand">− {formatPaise(pricing.discountPaise)}</span>}
                  />
                )}
              </dl>

              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-medium text-ink">Total</span>
                <span className="font-heading text-xl font-bold text-brand">
                  {formatPaise(pricing.totalPaise)}
                </span>
              </div>

              {/* Payment lands in the next task. A button that looks live and
                  does nothing is worse than one that says where it is up to. */}
              <Button size="lg" className="mt-4 w-full" disabled={!selectedId}>
                {selectedId ? 'Continue to payment' : 'Choose an address'}
              </Button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
