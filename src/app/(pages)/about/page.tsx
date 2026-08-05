import { ADDRESS_ONE_LINE, LEGAL_NAME } from '@/lib/business';

export const metadata = {
  title: 'About Bolti Rakhi',
  description:
    'Why we started Bolti Rakhi, and how a rakhi can carry a message across the distance.',
};

/**
 * This is where a first-time visitor works out why this shop is different.
 *
 * "Bolti Rakhi" means nothing to somebody who has just landed here, and the
 * whole business rests on them understanding it. Said plainly, once.
 */
export default function Page() {
  return (
    <>
      <h1>About us</h1>

      <p className="mt-2">
        Most of us do not live in the same city as our brothers and sisters any
        more. The rakhi still arrives — but the part that mattered, sitting
        together while it is tied, does not.
      </p>

      <p className="mt-4">
        A Bolti rakhi carries that part with it. You record a short video, write
        a letter, add a few photographs. We print a QR code on the packaging. He
        scans it when he opens the box, and hears you say it yourself.
      </p>

      <p className="mt-4">
        You do not have to record anything — the rakhi is a rakhi either way. But
        the option is there, and it costs nothing extra.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">What we sell</h2>
      <p className="mt-2">
        Rakhis, combos and chocolates, packed properly and shipped across India.
        Every Bolti rakhi can carry a message; the rest are simply good rakhis.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-ink">Who we are</h2>
      {/*
        Only what is true. A founder's story invented to fill this space is the
        kind of thing that has to be taken down later, by which time it has been
        screenshotted. If the owner wants to say more about themselves, that is
        theirs to write.
      */}
      <p className="mt-2">
        Bolti Rakhi is a small business in Jaipur. We do not make rakhis — we
        choose them, and we send them with the one thing a courier cannot carry:
        your voice.
      </p>
      <p className="mt-2">
        Every box has a QR code printed on it. You record a message when you
        order, your brother scans it when he opens the box, and he hears you
        before he ties the rakhi. That is the whole idea, and it is the only
        reason this shop exists.
      </p>

      <p className="mt-8 text-sm">
        {LEGAL_NAME} · {ADDRESS_ONE_LINE}
      </p>
    </>
  );
}
