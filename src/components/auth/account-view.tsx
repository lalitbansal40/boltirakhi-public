'use client';

import { ChevronRight, LogOut, MapPin, Package, Pencil, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { OrderStatus } from '@/components/account/order-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateName } from '@/lib/account-api';
import { listOrders, type OrderListRow } from '@/lib/checkout-api';
import { formatPaise } from '@/lib/money';

export function AccountView() {
  const { user, isReady, isSignedIn, signOut, setUser } = useAuth();
  const router = useRouter();

  const [recent, setRecent] = useState<OrderListRow[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Only once the session check has come back — redirecting before that
    // would bounce signed-in people to the login screen on every reload.
    if (isReady && !isSignedIn) router.replace('/login?next=/account');
  }, [isReady, isSignedIn, router]);

  useEffect(() => {
    if (!isReady || !isSignedIn) return;
    // A glimpse, not the list. Three rows is what fits before the nav.
    listOrders(1, 3)
      .then((result) => setRecent(result.items))
      .catch(() => setRecent([]));
  }, [isReady, isSignedIn]);

  async function saveName() {
    setBusy(true);
    try {
      const result = await updateName(nameDraft);
      if (user) setUser({ ...user, name: result.user.name });
      setEditing(false);
    } catch {
      // Left in edit mode on purpose: the text they typed is still on screen
      // to try again with.
    } finally {
      setBusy(false);
    }
  }

  if (!isReady || !isSignedIn) {
    return <div className="py-16 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        {editing ? (
          <div className="space-y-3">
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Your name
            </label>
            <Input
              id="name"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              placeholder="Your name"
              autoFocus
            />
            {/* Said plainly, because it is the question people actually have. */}
            <p className="text-xs text-muted">
              This does not change the name on orders you have already placed.
            </p>
            <div className="flex gap-2">
              <Button onClick={saveName} disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Name is optional — sign-in is by OTP and never asks for one.
                  The phone is what always exists. */}
              {user?.name ? (
                <p className="font-medium text-ink">{user.name}</p>
              ) : (
                <p className="text-muted">No name added</p>
              )}
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Phone className="size-4 text-brand" aria-hidden />
                +91 {user?.phone?.replace(/^91/, '')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNameDraft(user?.name ?? '');
                setEditing(true);
              }}
              className="flex min-h-11 items-center gap-1.5 px-1 text-sm text-brand hover:underline"
            >
              <Pencil className="size-4" aria-hidden />
              Edit
            </button>
          </div>
        )}
      </div>

      {recent && recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-ink">Recent orders</h2>
            <Link href="/account/orders" className="text-sm text-brand hover:underline">
              See all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {recent.map((order) => (
              <li key={order.orderNumber}>
                <Link
                  href={`/order/${order.orderNumber}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line p-3 text-sm hover:border-brand"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-ink">{order.orderNumber}</span>
                    <div className="mt-1">
                      <OrderStatus status={order.status} />
                    </div>
                  </div>
                  <span className="text-ink">{formatPaise(order.totalPaise)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stacked, not side by side. At 375px three columns of nav become three
          unreadable slivers. */}
      <nav className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
        <NavRow href="/account/orders" icon={<Package className="size-4" aria-hidden />}>
          Your orders
        </NavRow>
        <NavRow href="/account/addresses" icon={<MapPin className="size-4" aria-hidden />}>
          Saved addresses
        </NavRow>
      </nav>

      <Button
        variant="outline"
        onClick={async () => {
          await signOut();
          router.push('/');
        }}
      >
        <LogOut className="size-4" aria-hidden />
        Sign out
      </Button>
    </div>
  );
}

function NavRow({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 px-4 text-ink hover:bg-accent-soft">
      <span className="text-brand">{icon}</span>
      <span className="flex-1">{children}</span>
      <ChevronRight className="size-4 text-muted" aria-hidden />
    </Link>
  );
}
