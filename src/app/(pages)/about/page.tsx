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
      <p className="mt-2">[BUSINESS: two or three lines about the founders and the shop]</p>

      <p className="mt-8 text-sm">
        [BUSINESS: legal name] · [BUSINESS: registered address]
      </p>
    </>
  );
}
