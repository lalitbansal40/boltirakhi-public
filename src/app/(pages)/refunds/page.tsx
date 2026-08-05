export const metadata = {
  title: 'Refund and Cancellation Policy',
  description:
    'When a Bolti Rakhi order can be cancelled, when it can be returned, and how refunds are paid.',
};

/**
 * Written to be read, not to hide behind.
 *
 * A concealed "no returns" is the single thing most likely to end up as a
 * chargeback, and a payment gateway reads the customer's screenshot, not our
 * intentions. Anything restrictive here is said in the first sentence of its
 * own section.
 *
 * ⚠️ The bracketed facts are the business owner's to supply. Inventing a
 * refund window would be a promise made on their behalf that they never made.
 */
export default function Page() {
  return (
    <>
      <h1>Refunds and Cancellations</h1>

      <h2 className="mt-8 text-xl font-semibold text-ink">Cancelling an order</h2>
      <p className="mt-2">
        You can cancel any order that has not been dispatched yet. Write to us at{' '}
        <strong>[BUSINESS: support email]</strong> with your order number and we
        will cancel it and refund you in full.
      </p>
      <p className="mt-2">
        Once a parcel has left us, it cannot be cancelled — it can only be
        returned, and that is covered below.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Returns</h2>
      <p className="mt-2">
        <strong>[BUSINESS: state the return window plainly here — for example
        "We accept returns within 7 days of delivery", or "Rakhi is a seasonal
        item and we do not accept returns once delivered". Say whichever is
        true, in the first line.]</strong>
      </p>
      <p className="mt-2">
        If your order arrives damaged, or is not what you ordered, that is on us
        regardless of any return window. Send us a photograph at{' '}
        <strong>[BUSINESS: support email]</strong> within 48 hours of delivery
        and we will replace it or refund you.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">
        Orders with a recorded message
      </h2>
      <p className="mt-2">
        <strong>[BUSINESS: decide and state this. A Bolti rakhi with a recorded
        message has a QR code printed for that specific order, so it cannot be
        resold. Say whether these can be returned, and if not, say so before
        the customer records anything.]</strong>
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">How refunds are paid</h2>
      <p className="mt-2">
        Refunds go back to the same method you paid with — the same card, UPI ID
        or bank account. We cannot send a refund anywhere else, and we will
        never ask you for card or bank details to process one.
      </p>
      <p className="mt-2">
        Once we approve a refund it usually reaches you within{' '}
        <strong>[BUSINESS: number of working days — Razorpay is typically 5–7]</strong>{' '}
        working days. That part is with your bank, not with us.
      </p>
      <p className="mt-2">
        Delivery charges are refunded along with the order when the order is
        cancelled before dispatch, or when the fault is ours.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Reaching us</h2>
      <p className="mt-2">
        <strong>[BUSINESS: support email]</strong> ·{' '}
        <strong>[BUSINESS: phone]</strong>
      </p>

      <p className="mt-8 text-sm">
        [BUSINESS: legal name] · [BUSINESS: registered address]
      </p>
    </>
  );
}
