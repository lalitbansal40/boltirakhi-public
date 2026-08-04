'use client';

import { LogOut, Package, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';

export function AccountView() {
  const { user, isReady, isSignedIn, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only once the session check has actually come back — redirecting before
    // that would bounce signed-in people to the login screen on every reload.
    if (isReady && !isSignedIn) router.replace('/login?next=/account');
  }, [isReady, isSignedIn, router]);

  if (!isReady || !isSignedIn) {
    return <div className="py-16 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <p className="text-sm font-medium text-ink">Signed in as</p>
        <p className="mt-2 flex items-center gap-2 text-muted">
          <Phone className="size-4 text-brand" aria-hidden />
          {/* The number is stored as 91XXXXXXXXXX; shown the way people write it. */}
          +91 {user?.phone?.replace(/^91/, '')}
        </p>
        {user?.name && <p className="mt-1 text-ink">{user.name}</p>}
      </div>

      {/* A signpost, not a stub pretending to work. Orders and tracking are
          Phase 7; saying so is better than a link that goes nowhere. */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <p className="flex items-center gap-2 font-medium text-ink">
          <Package className="size-4 text-brand" aria-hidden />
          Your orders
        </p>
        <p className="mt-2 text-sm text-muted">
          Once you place an order it will appear here, with tracking.
        </p>
      </div>

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
