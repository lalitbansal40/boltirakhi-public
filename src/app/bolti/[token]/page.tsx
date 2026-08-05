import type { Metadata } from 'next';

import { BoltiComposer } from '@/components/bolti/bolti-composer';

export const metadata: Metadata = {
  title: 'Record your message',
  // A private message being written. Nothing here belongs in a search index.
  robots: { index: false, follow: false },
};

export default async function BoltiPage({
  params,
}: {
  // Next 16 hands params over as a Promise.
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink">Your Bolti message</h1>
      <p className="mt-2 text-muted">
        Record a video, write a letter, add photos — or any one of them. Your
        brother scans the QR on the packaging and sees this.
      </p>
      <div className="mt-6">
        <BoltiComposer token={token} />
      </div>
    </div>
  );
}
