'use client';

import { CheckCircle2, Clock, Mic, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { getOrder, type OrderView as Order } from '@/lib/checkout-api';
import { formatPaise } from '@/lib/money';

export function OrderView({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const { isReady, isSignedIn } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Same rule as everywhere else: isReady false means "not known yet".
    if (!isReady) return;
    if (!isSignedIn) {
      router.replace(`/login?next=/order/${orderNumber}`);
      return;
    }

    getOrder(orderNumber)
      .then((result) => setOrder(result.order))
      .catch(() => setNotFound(true));
  }, [isReady, isSignedIn, orderNumber, router]);

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Order not found</h1>
        <p className="mt-2 text-muted">
          We could not find that order on your account. Check the order number, or
          sign in with the number you ordered from.
        </p>
        <Button variant="outline" className="mt-6" render={<Link href="/">Back to shop</Link>} />
      </div>
    );
  }

  if (!order) return <div className="py-16 text-center text-muted">Loading your order…</div>;

  const paid = order.paymentStatus === 'paid';

  return (
    <div className="space-y-6">
      <div className="text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto size-10 text-brand" aria-hidden />
        ) : (
          // Not "failed": a created order may still be confirmed by the
          // webhook moments later, and calling it a failure would be wrong.
          <Clock className="mx-auto size-10 text-muted" aria-hidden />
        )}
        <h1 className="mt-3 font-heading text-2xl font-bold text-ink">
          {paid ? 'Order confirmed' : 'Order placed'}
        </h1>
        <p className="mt-1 text-muted">
          {paid
            ? 'We have your payment. You will get an SMS when it ships.'
            : 'We are still confirming your payment. This page will show it once it clears.'}
        </p>
        <p className="mt-3 font-mono text-sm text-ink">{order.orderNumber}</p>
      </div>

      {order.hasBolti && (
        <div className="rounded-[var(--radius-card)] bg-accent-soft/60 p-4">
          <p className="flex items-center gap-2 font-medium text-ink">
            <Mic className="size-4 text-brand" aria-hidden />
            Your rakhi carries a message
          </p>
          <p className="mt-1 text-sm text-muted">
            Record it any time before we pack the parcel. It is optional — the
            rakhi ships either way.
          </p>
          {order.boltiTokens?.map((token) => (
            <Button
              key={token}
              className="mt-3"
              render={<Link href={`/bolti/`}>Record your message</Link>}
            />
          ))}
        </div>
      )}

      <div className="rounded-[var(--radius-card)] border border-line">
        <ul className="divide-y divide-line">
          {order.items.map((item, index) => (
            <li key={`${item.slug}-${index}`} className="flex justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-ink">{item.title}</p>
                <p className="text-muted">Qty {item.qty}</p>
              </div>
              <p className="text-ink">{formatPaise(item.pricePaise * item.qty)}</p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-line p-4 text-sm">
          <Row label="Subtotal" value={formatPaise(order.amount.subtotalPaise)} />
          <Row
            label="Delivery"
            value={
              order.amount.shippingPaise === 0 ? (
                <span className="text-brand">FREE</span>
              ) : (
                formatPaise(order.amount.shippingPaise)
              )
            }
          />
          {order.amount.discountPaise > 0 && (
            <Row
              label="Discount"
              value={<span className="text-brand">− {formatPaise(order.amount.discountPaise)}</span>}
            />
          )}
          <div className="flex justify-between border-t border-line pt-2 font-medium text-ink">
            <span>Total</span>
            <span>{formatPaise(order.amount.totalPaise)}</span>
          </div>
        </dl>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line p-4 text-sm">
        <p className="flex items-center gap-2 font-medium text-ink">
          <Package className="size-4 text-brand" aria-hidden />
          Delivering to
        </p>
        <p className="mt-2 text-muted">
          {order.shippingAddress.name}
          <br />
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
          {order.shippingAddress.pincode}
        </p>
      </div>

      <Button variant="outline" className="w-full" render={<Link href="/">Continue shopping</Link>} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
