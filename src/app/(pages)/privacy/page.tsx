import {
  ADDRESS_ONE_LINE,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_HREF,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_HREF,
} from '@/lib/business';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'What Bolti Rakhi collects, who it is shared with, and how long a recorded message is kept.',
};

/**
 * The video is the part that matters here.
 *
 * Everything else on this page is the usual: a phone number, an address, an
 * order history. But a Bolti message is a private recording one person made
 * for one other person, sitting on our storage. Saying who can reach it and
 * how long we keep it is the whole reason this page needs to be honest rather
 * than boilerplate.
 */
export default function Page() {
  return (
    <>
      <h1>Privacy Policy</h1>

      <h2 className="mt-8 text-xl font-semibold text-ink">What we collect</h2>
      <p className="mt-2">
        <strong>Your mobile number</strong>, because that is how you sign in. We
        send a one-time code to it; we do not store a password.
      </p>
      <p className="mt-2">
        <strong>Your delivery address</strong> and the name and phone number for
        the parcel, so the courier can find it.
      </p>
      <p className="mt-2">
        <strong>Your orders</strong> — what you bought, what you paid, and where
        it went.
      </p>
      <p className="mt-2">
        <strong>Anything you record for a Bolti rakhi</strong> — a video, a
        letter, photographs. See the section below.
      </p>
      <p className="mt-2">
        We do not store your card, UPI or bank details. Those go straight to our
        payment provider and never touch our servers.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Your Bolti message</h2>
      <p className="mt-2">
        A recorded message is stored privately. It is not listed anywhere, not
        indexed by search engines, and cannot be opened by guessing — the link
        carries a long random code that only exists on your packaging.
      </p>
      <p className="mt-2">
        Anyone holding that link can view the message. That is deliberate: your
        brother scans a QR code and watches it without making an account. It
        also means anyone he shares the link with can see it too.
      </p>
      <p className="mt-2">
        <strong>
          We keep a recording for 12 months from the date of the order, and then
          delete it.
        </strong>{' '}
        If you would like it removed sooner, write to us and we will delete it —
        you do not have to give a reason. Deleting it stops the QR code from
        playing anything.
      </p>
      <p className="mt-2">
        Our staff can access recordings only to fix a problem you have reported
        or to comply with a legal requirement.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Who else sees your data</h2>
      <p className="mt-2">
        We use a small number of services to run the shop, and each sees only
        what it needs:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
        <li>
          <strong>Razorpay</strong> — payments. They receive your payment details
          directly; we never see them.
        </li>
        <li>
          <strong>Our delivery partner</strong> — your name, address and phone,
          so the parcel can be delivered.
        </li>
        <li>
          <strong>Our SMS provider</strong> — your mobile number, to send
          sign-in codes and order updates.
        </li>
        <li>
          <strong>Amazon Web Services</strong> — storage for product images and
          for anything you record.
        </li>
      </ul>
      <p className="mt-2">We do not sell your data, and we do not share it for advertising.</p>

      <h2 className="mt-8 text-xl font-semibold text-ink">What you can ask for</h2>
      <p className="mt-2">
        Write to{' '}
        <a href={SUPPORT_EMAIL_HREF} className="font-semibold text-brand hover:underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        and we will tell you
        what we hold about you, correct it, or delete it. Deleting your account
        does not remove records we are required to keep for tax purposes, and it
        does not undo an order already dispatched.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Cookies</h2>
      <p className="mt-2">
        We set one cookie, to keep you signed in. It cannot be read by scripts
        in your browser. We do not use advertising or tracking cookies.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Contact</h2>
      <p className="mt-2">
        <a href={SUPPORT_EMAIL_HREF} className="font-semibold text-brand hover:underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        ·{' '}
        <a href={SUPPORT_PHONE_HREF} className="font-semibold text-brand hover:underline">
          {SUPPORT_PHONE_DISPLAY}
        </a>
      </p>

      <p className="mt-8 text-sm">
        {LEGAL_NAME} · {ADDRESS_ONE_LINE}
      </p>
    </>
  );
}
