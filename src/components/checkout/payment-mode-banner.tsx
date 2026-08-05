'use client';

import { AlertTriangle, FlaskConical } from 'lucide-react';

import type { PaymentStatus } from '@/lib/checkout-api';

/**
 * Says, in plain sight, which Razorpay account this checkout is talking to.
 *
 * A full-width band rather than small print, because the mistake it exists to
 * prevent is somebody assuming no real money moves. That assumption is only
 * ever wrong in one direction, and it is expensive.
 */
export function PaymentModeBanner({ status }: { status: PaymentStatus | null }) {
  if (!status) return null;

  // Live and correctly configured is the normal state and needs no notice. A
  // banner here would be noise, and noise is what people stop reading.
  if (status.mode === 'live' && status.configured && !status.mismatch) return null;

  if (status.mismatch) {
    return (
      <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-card)] border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-semibold">Payment configuration mismatch.</span>{' '}
          The declared mode and the loaded key disagree. Do not take payments until
          this is fixed.
        </p>
      </div>
    );
  }

  if (!status.configured) {
    return (
      <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-card)] border border-line bg-accent-soft/60 p-3 text-sm text-ink">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <p>
          <span className="font-semibold">Payments are not switched on yet.</span>{' '}
          You can review your order, but you cannot pay for it here today.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-card)] border border-brand bg-accent-soft p-3 text-sm text-ink">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <p>
        <span className="font-semibold">TEST mode.</span> No real money will be
        charged. Use a Razorpay test card.
      </p>
    </div>
  );
}
