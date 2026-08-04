'use client';

import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useCart } from '@/components/cart/cart-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/lib/types';
import { formatPaise } from '@/lib/money';
import { MAX_QTY } from '@/lib/cart-storage';

/**
 * The cart.
 *
 * Every number shown here comes from /api/cart/price. Nothing on this page is
 * added up in the browser — the total a customer reads has to be the total
 * their card is charged, and the only way to guarantee that is for both to
 * come out of the same server code.
 */

export function CartView({ categories }: { categories: Category[] }) {
  const {
    lines,
    pricing,
    isReady,
    isPricing,
    pricingFailed,
    couponCode,
    updateQty,
    remove,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  // Until localStorage has been read the cart is empty because nothing has
  // loaded, not because it is empty. Saying "your cart is empty" here would be
  // wrong for a moment on every single visit.
  if (!isReady) {
    return <div className="py-16 text-center text-muted">Loading your cart…</div>;
  }

  if (lines.length === 0) {
    return <EmptyCart categories={categories} />;
  }

  const hasBlockedLine = pricing?.lines.some((line) => line.issue) ?? false;
  const shortOfFreeDelivery =
    pricing && pricing.shippingPaise > 0
      ? pricing.freeDeliveryAbovePaise - pricing.subtotalPaise
      : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line border-y border-line">
        {(pricing?.lines ?? []).map((line) => (
          <li key={line.productId} className="flex gap-3 py-4 sm:gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-accent-soft sm:size-24">
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted">
                  <ShoppingBag className="size-6" aria-hidden />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {line.slug ? (
                <Link
                  href={`/product/${line.slug}`}
                  className="font-medium text-ink hover:text-brand"
                >
                  {line.title}
                </Link>
              ) : (
                <p className="font-medium text-ink">{line.title}</p>
              )}

              {line.type === 'bolti' && (
                <Badge variant="secondary" className="mt-1">
                  Carries your voice
                </Badge>
              )}

              {/* The problem is stated, and then the customer decides. The line
                  is never removed for them — they chose this, and finding it
                  silently gone is worse than being told it is unavailable. */}
              {line.issue && (
                <p className="mt-1 flex items-start gap-1.5 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {line.issue === 'unavailable'
                    ? 'No longer available. Remove it to carry on.'
                    : `Only ${line.availableQty} left. Lower the quantity or remove it.`}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <QtyStepper
                  qty={line.qty}
                  max={line.availableQty ?? MAX_QTY}
                  onChange={(qty) => updateQty(line.productId, qty)}
                  disabled={line.issue === 'unavailable'}
                />

                <button
                  type="button"
                  onClick={() => remove(line.productId)}
                  // 44px minimum: this sits next to a stepper, and a mis-tap
                  // here deletes something.
                  className="flex min-h-11 items-center gap-1.5 px-1 text-sm text-muted hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Remove
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium text-ink">
                {formatPaise(line.issue ? 0 : line.lineTotalPaise)}
              </p>
              {line.qty > 1 && !line.issue && (
                <p className="text-sm text-muted">{formatPaise(line.pricePaise)} each</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <h2 className="font-heading text-lg font-semibold text-ink">Order summary</h2>

          {pricingFailed ? (
            <p className="mt-4 text-sm text-destructive">
              We could not work out your total just now. Check your connection and
              try again.
            </p>
          ) : !pricing ? (
            <p className="mt-4 text-sm text-muted">Working out your total…</p>
          ) : (
            <>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatPaise(pricing.subtotalPaise)} />
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
                    value={
                      <span className="text-brand">
                        − {formatPaise(pricing.discountPaise)}
                      </span>
                    }
                  />
                )}
              </dl>

              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-medium text-ink">Total</span>
                <span className="font-heading text-xl font-bold text-brand">
                  {formatPaise(pricing.totalPaise)}
                </span>
              </div>

              {/* Delivery is decided on the subtotal before any discount, which
                  is what the backend does. Saying otherwise here would promise
                  free delivery and then charge for it. */}
              {shortOfFreeDelivery > 0 && (
                <p className="mt-3 rounded-md bg-accent-soft/60 px-3 py-2 text-sm text-ink">
                  Add {formatPaise(shortOfFreeDelivery)} more for free delivery.
                </p>
              )}

              <div className="mt-4 border-t border-line pt-4">
                {couponCode && !pricing.couponError ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-ink">
                      <span className="font-medium">{couponCode}</span> applied
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="min-h-11 px-1 text-muted hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (couponInput.trim()) applyCoupon(couponInput);
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value)}
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      className="uppercase"
                    />
                    <Button type="submit" variant="outline" disabled={!couponInput.trim()}>
                      Apply
                    </Button>
                  </form>
                )}

                {/* Under the field, not a page-level banner: a rejected coupon
                    is a small correction, not a reason to shake the page. */}
                {pricing.couponError && (
                  <p className="mt-2 text-sm text-destructive">{pricing.couponError}</p>
                )}
              </div>

              <Button
                size="lg"
                className="mt-4 w-full"
                // Blocked here rather than at checkout, where the failure would
                // come back as a rejection with no explanation attached to it.
                disabled={hasBlockedLine || isPricing}
              >
                {hasBlockedLine ? 'Fix the items above' : 'Proceed to checkout'}
              </Button>

              <p className="mt-2 text-center text-xs text-muted">
                Sign-in and payment arrive in the next step.
              </p>
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

function QtyStepper({
  qty,
  max,
  onChange,
  disabled,
}: {
  qty: number;
  max: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center rounded-md border border-line">
      {/* size-11 is 44px — the smallest target a thumb hits reliably. */}
      <button
        type="button"
        aria-label="Reduce quantity"
        disabled={disabled || qty <= 1}
        onClick={() => onChange(qty - 1)}
        className="flex size-11 items-center justify-center text-ink disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || qty >= max}
        onClick={() => onChange(qty + 1)}
        className="flex size-11 items-center justify-center text-ink disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/**
 * An empty cart is a place to leave from, not a wall.
 *
 * "Your cart is empty" and nothing else asks the visitor to find their own way
 * back. The categories are right here.
 */
function EmptyCart({ categories }: { categories: Category[] }) {
  return (
    <div className="py-12 text-center">
      <ShoppingBag className="mx-auto size-10 text-muted" aria-hidden />
      <h2 className="mt-4 font-heading text-xl font-semibold text-ink">
        Your cart is empty
      </h2>
      <p className="mt-2 text-muted">
        Pick a rakhi, and add a video message your brother can scan.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button key={category._id} variant="outline" render={
            <Link href={`/rakhi/${category.slug}`}>{category.name}</Link>
          } />
        ))}
      </div>
    </div>
  );
}
