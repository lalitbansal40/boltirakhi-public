import {
  ADDRESS_ONE_LINE,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_HREF,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_HREF,
} from '@/lib/business';

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
 * The damaged-or-missing paragraph is not a softening of the no-returns rule
 * and must not be removed to make the policy look firmer. A blanket "no
 * refunds under any circumstances" is unenforceable under the Consumer
 * Protection (E-Commerce) Rules, 2020, and payment gateways reject a policy
 * page that claims it. Keeping it is what makes the rest of this page stand.
 */
export default function Page() {
  return (
    <>
      <h1>Refunds and Cancellations</h1>

      <h2 className="mt-8 text-xl font-semibold text-ink">Returns</h2>
      <p className="mt-2">
        <strong>
          A rakhi is a seasonal, date-bound item — after Raksha Bandhan it
          cannot be sold to anyone else. We do not accept returns, and we do not
          refund a change of mind.
        </strong>
      </p>
      <p className="mt-2">
        Please read the description and look at the photographs before you
        order. If you are unsure which rakhi to pick, ring us — we would much
        rather help you choose than take an order you regret.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Cancelling an order</h2>
      <p className="mt-2">
        <strong>You can cancel any order right up until we ship it.</strong>{' '}
        Write to{' '}
        <a href={SUPPORT_EMAIL_HREF} className="font-semibold text-brand hover:underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        or ring us with your order number, and we will cancel it and refund you
        in full, delivery charges included.
      </p>
      <p className="mt-2">
        Once the parcel has left us it cannot be cancelled. During the fortnight
        before Raksha Bandhan we ship quickly, so please tell us as soon as you
        know.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">
        Orders with a recorded message
      </h2>
      <p className="mt-2">
        A Bolti rakhi carries a QR code printed for your order alone, so it
        cannot be sold to anybody else once it is made.{' '}
        <strong>
          You can still cancel it in full before we ship — recording a message
          does not lock you in.
        </strong>{' '}
        When you cancel, your video is deleted along with the order.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">
        If something arrives damaged, wrong, or not at all
      </h2>
      <p className="mt-2">
        This is separate from the rule above, and the seasonal rule does not
        apply to it. If your parcel arrives broken, if it is not what you
        ordered, or if it never reaches you, that is ours to put right — we
        refund you in full or send a replacement, whichever you would rather
        have.
      </p>
      <p className="mt-2">
        Send a photograph to{' '}
        <a href={SUPPORT_EMAIL_HREF} className="font-semibold text-brand hover:underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        within 48 hours of delivery. For a parcel that never arrived, write to
        us whenever you realise — there is no window on that one.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">How refunds are paid</h2>
      <p className="mt-2">
        Refunds go back to the same method you paid with — the same card, UPI ID
        or bank account. We cannot send a refund anywhere else, and we will
        never ask you for card or bank details to process one.
      </p>
      <p className="mt-2">
        Once we approve a refund it usually reaches you within{' '}
        <strong>5 to 7 working days</strong>. That part is with your bank, not
        with us.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Reaching us</h2>
      <p className="mt-2">
        <a href={SUPPORT_EMAIL_HREF} className="font-semibold text-brand hover:underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        ·{' '}
        <a
          href={SUPPORT_PHONE_HREF}
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          {SUPPORT_PHONE_DISPLAY}
        </a>
      </p>

      <p className="mt-8 text-sm">
        {LEGAL_NAME} · {ADDRESS_ONE_LINE}
      </p>
    </>
  );
}
