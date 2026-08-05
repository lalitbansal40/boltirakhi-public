import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms you agree to when you order from Bolti Rakhi.',
};

/**
 * Refunds and shipping are not restated here — they link out.
 *
 * The same rule written in two places drifts, and the day it does, one of the
 * two is wrong and a customer is holding a screenshot of it.
 */
export default function Page() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="mt-2">
        These terms apply when you buy from this site. By placing an order you
        accept them.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Placing an order</h2>
      <p className="mt-2">
        An order you place is an offer to buy. We accept it when we dispatch the
        parcel, not when the payment goes through. If we cannot fulfil an order —
        an item sells out, or we cannot deliver to your pincode — we will tell you
        and refund you in full.
      </p>
      <p className="mt-2">
        Prices and offers can change. The price you pay is the one shown on the
        checkout page when you pay, and nothing changes it afterwards.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">
        The message you record
      </h2>
      <p className="mt-2">
        A Bolti rakhi lets you record a video, write a letter and add photographs.
        That content stays yours. You give us permission only to store it and show
        it to whoever opens your QR code — nothing else. We do not use it in
        advertising and we do not show it to anyone else.
      </p>
      <p className="mt-2">
        You are responsible for what you upload. You must have the right to it,
        and it must not be unlawful, obscene, or intended to harass anyone. We can
        remove content that breaks this and refund the order, and we will tell you
        if we do.
      </p>
      <p className="mt-2">
        Once you send a message it is sealed, because the QR code is printed at
        that moment and goes onto the packaging. It cannot be changed afterwards.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Coupons</h2>
      <p className="mt-2">
        Coupons apply to the value of the items, not to delivery. We may withdraw
        a coupon, and we may cancel orders where a code has been used in a way it
        was clearly not meant for.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Your account</h2>
      <p className="mt-2">
        You sign in with your mobile number and a one-time code. Keep your phone
        and that code to yourself — anyone with them can place orders as you.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">
        Delivery, refunds and privacy
      </h2>
      <p className="mt-2">
        These have pages of their own so there is only ever one version of each:{' '}
        <Link href="/shipping" className="text-brand underline-offset-4 hover:underline">
          Shipping
        </Link>
        ,{' '}
        <Link href="/refunds" className="text-brand underline-offset-4 hover:underline">
          Refunds and Cancellations
        </Link>
        , and{' '}
        <Link href="/privacy" className="text-brand underline-offset-4 hover:underline">
          Privacy
        </Link>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Liability</h2>
      <p className="mt-2">
        If something goes wrong with an order, what we owe you is limited to what
        you paid for that order. Nothing here removes rights you have under Indian
        consumer law.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Governing law</h2>
      <p className="mt-2">
        These terms are governed by the laws of India, and the courts at{' '}
        <strong>[BUSINESS: city]</strong> have jurisdiction.
      </p>

      <p className="mt-8 text-sm">
        [BUSINESS: legal name] · [BUSINESS: registered address] ·{' '}
        [BUSINESS: support email]
      </p>
    </>
  );
}
