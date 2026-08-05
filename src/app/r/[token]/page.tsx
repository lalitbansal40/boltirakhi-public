import type { Metadata } from 'next';

import { RevealView } from '@/components/reveal/reveal-view';

export const metadata: Metadata = {
  title: 'A message for you',
  // Somebody's private message to their brother. It must never be indexed,
  // and links out of it must not be followed either.
  robots: { index: false, follow: false },
};

export default async function RevealPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <RevealView token={token} />
    </div>
  );
}
