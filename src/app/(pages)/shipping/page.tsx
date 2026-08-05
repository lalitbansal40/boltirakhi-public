export const metadata = {
  title: 'Shipping Policy',
  description:
    'How Bolti Rakhi ships across India, what delivery costs, and when it is free.',
};

/**
 * Delivery charges are stated here exactly as the checkout calculates them.
 *
 * A customer who reads a number here and is charged a different one at
 * checkout has been misled, and this is the page they will quote back. If the
 * threshold or the slabs change in admin, this page changes with them.
 *
 * ⚠️ Nothing here promises a delivery date. No courier is wired up, so none
 * has committed to anything — and "arrives before Rakhi" is the one promise
 * that makes the gift worthless when it breaks, because 28 August does not
 * move.
 */
export default function Page() {
  return (
    <>
      <h1>Shipping Policy</h1>

      <h2 className="mt-8 text-xl font-semibold text-ink">Where we deliver</h2>
      <p className="mt-2">We ship across India. We do not ship outside India at present.</p>
      <p className="mt-2">
        Some pincodes are harder to reach than others. If we cannot deliver to
        yours, we will contact you and refund you in full rather than let the
        order sit.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">What delivery costs</h2>
      <p className="mt-2">
        Delivery is <strong>free on orders of ₹499 and above</strong>.
      </p>
      <p className="mt-2">
        Below ₹499, the charge depends on where the parcel is going and what it
        weighs. It starts at ₹49 and is shown in your cart and again at checkout
        before you pay. You will never be charged more than the amount shown on
        the checkout page.
      </p>
      <p className="mt-2">
        The ₹499 is worked out on the value of the items <em>before</em> any
        coupon. If your cart crosses ₹499 and a coupon then brings it below,
        delivery stays free.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">When it arrives</h2>
      <p className="mt-2">
        We dispatch as quickly as we can, and send you an SMS with tracking
        details as soon as the parcel leaves us.
      </p>
      <p className="mt-2">
        We do not promise a delivery date, because the courier decides that and
        we would rather not tell you something we cannot guarantee. If Rakhi is
        close and you are worried about timing, write to us before you order and
        we will tell you honestly whether it can be done.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">If something goes wrong</h2>
      <p className="mt-2">
        If your parcel is delayed, damaged, or does not arrive, contact us at{' '}
        <strong>[BUSINESS: support email]</strong> or{' '}
        <strong>[BUSINESS: phone]</strong> with your order number and we will
        sort it out.
      </p>

      <p className="mt-8 text-sm">
        [BUSINESS: legal name] · [BUSINESS: registered address]
      </p>
    </>
  );
}
