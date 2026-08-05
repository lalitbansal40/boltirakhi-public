import { Phone } from 'lucide-react';

import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_HREF } from '@/lib/business';

/**
 * "Call us if you need something else."
 *
 * Placed *below* the pay button, never above it. Above, it pulls attention
 * away at the moment someone had decided to buy — this is a way out for a
 * problem, not a competing option.
 *
 * The number is a tel: link, because on a phone a written number is half a
 * feature. One tap should open the dialer.
 */
export function SupportNote({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="mt-3 text-center text-xs text-muted">
        Need something changed?{' '}
        <a href={SUPPORT_PHONE_HREF} className="text-brand hover:underline">
          Call {SUPPORT_PHONE_DISPLAY}
        </a>
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-[var(--radius-card)] bg-accent-soft/50 p-3 text-sm">
      <p className="font-medium text-ink">Want to add something?</p>
      <p className="mt-1 text-muted">
        Gift wrapping, sending to more than one address, or anything special —
        call us and we will arrange it.
      </p>
      <a
        href={SUPPORT_PHONE_HREF}
        className="mt-2 inline-flex min-h-11 items-center gap-2 font-medium text-brand hover:underline"
      >
        <Phone className="size-4" aria-hidden />
        {SUPPORT_PHONE_DISPLAY}
      </a>
    </div>
  );
}
