'use client';

import { Mic, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { OrderStatus } from '@/components/account/order-status';
import { Button } from '@/components/ui/button';
import { listOrders, type OrderListRow, type Paginated } from '@/lib/checkout-api';
import type { Category } from '@/lib/types';
import { formatPaise } from '@/lib/money';

export function OrdersList({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { isReady, isSignedIn } = useAuth();

  const [data, setData] = useState<Paginated<OrderListRow> | null>(null);
  const [page, setPage] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // isReady false means "not known yet", not "signed out". Redirecting on it
    // throws a signed-in customer to the login page on every refresh.
    if (!isReady) return;
    if (!isSignedIn) {
      router.replace('/login?next=/account/orders');
      return;
    }

    listOrders(page)
      .then(setData)
      .catch(() => setFailed(true));
  }, [isReady, isSignedIn, page, router]);

  if (!isReady || !isSignedIn) return <div className="py-16 text-center text-muted">Loading…</div>;

  if (failed) {
    return (
      <p className="py-16 text-center text-destructive">
        We could not load your orders. Please try again.
      </p>
    );
  }

  if (!data) return <div className="py-16 text-center text-muted">Loading your orders…</div>;

  if (data.items.length === 0) {
    return (
      // A way out, not a wall. Someone with no orders is someone who has not
      // bought yet, and the categories are the point of the page.
      <div className="py-12 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted" aria-hidden />
        <h2 className="mt-4 font-heading text-xl font-semibold text-ink">No orders yet</h2>
        <p className="mt-2 text-muted">When you place one, it will show up here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category._id}
              variant="outline"
              render={<Link href={`/rakhi/${category.slug}`}>{category.name}</Link>}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {data.items.map((order) => (
          <li key={order.orderNumber}>
            <Link
              href={`/order/${order.orderNumber}`}
              className="flex gap-3 rounded-[var(--radius-card)] border border-line p-3 transition-colors hover:border-brand"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-accent-soft">
                {order.firstItemImage ? (
                  <Image
                    src={order.firstItemImage}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted">
                    <Package className="size-5" aria-hidden />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-ink">{order.orderNumber}</span>
                  <OrderStatus status={order.status} />
                </div>
                <p className="mt-1 truncate text-sm text-muted">
                  {order.firstItemTitle}
                  {order.itemCount > 1 && ` + ${order.itemCount - 1} more`}
                </p>
                {/* A marker, not a link. The recorder needs the token, and the
                    token lives on the detail page this row already opens. */}
                {order.hasBolti && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-brand">
                    <Mic className="size-3.5" aria-hidden />
                    Carries a message
                  </p>
                )}
                <p className="mt-1 text-sm text-muted">
                  {new Date(order.placedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <p className="font-medium text-ink">{formatPaise(order.totalPaise)}</p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Only when there is somewhere to go. One page of orders needs no
          controls under it. */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
