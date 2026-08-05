import {
  ADDRESS_LINES,
  GST_NUMBER,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_HREF,
  SUPPORT_HOURS,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_HREF,
} from '@/lib/business';

export const metadata = {
  title: 'Contact us',
  description: 'How to reach Bolti Rakhi about an order, a delivery or a refund.',
};

/**
 * A real address and a real number, not a form.
 *
 * A contact form that posts nowhere is worse than no contact page: it takes
 * someone's problem, tells them it has been sent, and drops it. Until there is
 * somewhere for a form to go, the honest thing is an email address they can
 * see and copy.
 */
export default function Page() {
  return (
    <>
      <h1>Contact us</h1>
      <p className="mt-2">
        Write to us about anything — an order, a delivery, a refund, or a rakhi
        you cannot decide on. A person reads these.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-[var(--radius-card)] border border-line p-4">
          <p className="text-sm font-medium text-ink">Email</p>
          <a
            href={SUPPORT_EMAIL_HREF}
            className="mt-1 block text-lg text-brand hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          <p className="mt-1 text-sm text-muted">
            Include your order number if you have one — it saves a round trip.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line p-4">
          <p className="text-sm font-medium text-ink">Phone</p>
          <a href={SUPPORT_PHONE_HREF} className="mt-1 block text-lg text-brand hover:underline">{SUPPORT_PHONE_DISPLAY}</a>
          <p className="mt-1 text-sm text-muted">{SUPPORT_HOURS}</p>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold text-ink">Where we are</h2>
      <p className="mt-2">
        {LEGAL_NAME}
        {ADDRESS_LINES.map((line) => (
          <span key={line}>
            <br />
            {line}
          </span>
        ))}
      </p>
      <p className="mt-2 text-sm">GSTIN: {GST_NUMBER}</p>
    </>
  );
}
