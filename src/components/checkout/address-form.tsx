'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAddress, type Address, type AddressInput } from '@/lib/account-api';

/**
 * The rules the server enforces, repeated here.
 *
 * Kept identical on purpose. A frontend that is more lenient sends something
 * the server rejects, and the rejection arrives as a generic error with no
 * indication of which field was wrong.
 */
const PHONE = /^(\+?91[\s-]?)?[6-9]\d{9}$/;
const PINCODE = /^[1-9]\d{5}$/;

const EMPTY: AddressInput = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (address: Address) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!PHONE.test(form.phone)) return setError('Enter a valid Indian mobile number');
    if (!PINCODE.test(form.pincode)) return setError('Enter a valid 6-digit pincode');

    setBusy(true);
    try {
      const result = await createAddress(form);
      onSaved(result.address);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the address');
      setBusy(false);
    }
  }

  return (
    // One column throughout. At 375px a two-column address form puts city and
    // state in boxes too narrow to read what you typed.
    <form onSubmit={submit} className="space-y-3">
      <Field
        label="Full name"
        value={form.name}
        onChange={(v) => set('name', v)}
        // This is the name printed on the parcel, not an account nickname.
        autoComplete="name"
        required
      />
      <Field
        label="Mobile number"
        value={form.phone}
        onChange={(v) => set('phone', v)}
        autoComplete="tel"
        inputMode="numeric"
        required
      />
      <Field
        label="Address"
        value={form.line1}
        onChange={(v) => set('line1', v)}
        autoComplete="street-address"
        placeholder="House / flat, street"
        required
      />
      <Field
        label="Area, landmark (optional)"
        value={form.line2 ?? ''}
        onChange={(v) => set('line2', v)}
        autoComplete="address-line2"
      />
      <Field
        label="Pincode"
        value={form.pincode}
        onChange={(v) => set('pincode', v)}
        autoComplete="postal-code"
        inputMode="numeric"
        required
      />
      <Field
        label="City"
        value={form.city}
        onChange={(v) => set('city', v)}
        autoComplete="address-level2"
        required
      />
      <Field
        label="State"
        value={form.state}
        onChange={(v) => set('state', v)}
        autoComplete="address-level1"
        required
      />

      {/* Country is fixed. International shipping is a separate piece of work
          and offering the field would imply it already exists. */}
      <p className="text-sm text-muted">Delivering within India only.</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save address'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  /** The value, not the event — Input's own onChange is omitted below. */
  onChange: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, '-');

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1"
        {...rest}
      />
    </div>
  );
}
