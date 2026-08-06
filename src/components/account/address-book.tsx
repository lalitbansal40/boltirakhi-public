'use client';

import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { AddressForm } from '@/components/checkout/address-form';
import { Button } from '@/components/ui/button';
import { deleteAddress, listAddresses, setDefaultAddress, type Address } from '@/lib/account-api';

export function AddressBook() {
  const router = useRouter();
  const { isReady, isSignedIn } = useAuth();

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isSignedIn) {
      router.replace('/login?next=/account/addresses');
      return;
    }

    listAddresses()
      .then((result) => setAddresses(result.addresses))
      .catch(() => setError('Could not load your addresses.'));
  }, [isReady, isSignedIn, router]);

  async function remove(address: Address) {
    /**
     * Asked before, not undone after. A deleted address cannot be recovered,
     * and the last one going means retyping it at the next checkout — so that
     * case gets its own warning rather than the same generic one.
     */
    const isLast = (addresses?.length ?? 0) === 1;
    const question = isLast
      ? 'This is your only saved address. Delete it? You will have to type it again at checkout.'
      : `Delete the address for ${address.name}?`;

    if (!window.confirm(question)) return;

    setBusyId(address.id);
    try {
      await deleteAddress(address.id);
      const result = await listAddresses();
      setAddresses(result.addresses);
    } catch {
      setError('Could not delete that address.');
    } finally {
      setBusyId(null);
    }
  }

  async function makeDefault(address: Address) {
    setBusyId(address.id);
    try {
      // Only this one is sent. The server clears the flag on the others, so
      // doing it here as well would be a second opinion that could disagree.
      await setDefaultAddress(address.id);
      const result = await listAddresses();
      setAddresses(result.addresses);
    } catch {
      setError('Could not change your default address.');
    } finally {
      setBusyId(null);
    }
  }

  if (!isReady || !isSignedIn) return <div className="py-16 text-center text-muted">Loading…</div>;
  if (!addresses) {
    return <div className="py-16 text-center text-muted">Loading your addresses…</div>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {addresses.length === 0 && !adding && (
        <div className="rounded-[var(--radius-card)] border border-line p-6 text-center">
          <MapPin className="mx-auto size-8 text-muted" aria-hidden />
          <p className="mt-3 text-muted">No saved addresses yet.</p>
        </div>
      )}

      {/* The server returns the default first. Sorting again here would be a
          second opinion about something already decided. */}
      <ul className="space-y-3">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="rounded-[var(--radius-card)] border border-line p-4 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">
                  {address.name}
                  {address.label && <span className="ml-2 text-muted">({address.label})</span>}
                </p>
                <p className="mt-1 text-muted">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  +91 {address.phone.replace(/^(\+?91)/, '')}
                </p>
              </div>

              {address.isDefault && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                  <Star className="size-3 fill-brand" aria-hidden />
                  Default
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => makeDefault(address)}
                  disabled={busyId === address.id}
                  className="min-h-11 rounded-sm px-1 text-sm text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 active:opacity-70 disabled:opacity-50"
                >
                  Make default
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(address)}
                disabled={busyId === address.id}
                // 44px, and it sits beside another action that does not delete
                // anything.
                className="flex min-h-11 items-center gap-1.5 rounded-sm px-1 text-sm text-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 active:opacity-70 disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="rounded-[var(--radius-card)] border border-line p-4">
          {/* The same form the checkout uses. It carries the rules the server
              enforces, and a second copy would drift from them. */}
          <AddressForm
            onSaved={(address) => {
              setAddresses((current) => [...(current ?? []), address]);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden />
          Add an address
        </Button>
      )}
    </div>
  );
}
