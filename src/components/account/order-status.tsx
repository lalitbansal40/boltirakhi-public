/**
 * An order's state, in the customer's language.
 *
 * `processing` means "we are packing it", not a status code. And `created` is
 * never called a failure — the webhook may still be on its way, and telling
 * someone their payment failed when it did not is the one message here that
 * causes a phone call.
 */
const LABELS: Record<string, { text: string; className: string }> = {
  created: { text: 'Confirming payment', className: 'bg-accent-soft text-ink' },
  paid: { text: 'Confirmed', className: 'bg-brand/10 text-brand' },
  processing: { text: 'Being packed', className: 'bg-brand/10 text-brand' },
  shipped: { text: 'On its way', className: 'bg-brand/10 text-brand' },
  delivered: { text: 'Delivered', className: 'bg-brand text-brand-fg' },
  cancelled: { text: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
};

export function OrderStatus({ status }: { status: string }) {
  const label = LABELS[status] ?? { text: status, className: 'bg-accent-soft text-ink' };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${label.className}`}>
      {label.text}
    </span>
  );
}
