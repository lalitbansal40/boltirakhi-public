import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * A not-found boundary inside the segment itself.
 *
 * Without one here, notFound() falls through to the root boundary and the
 * response goes out as 200 — the page reads correctly but a crawler goes by
 * the status line and would index every wrong URL as real.
 */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold text-brand">
        We could not find that category
      </h1>
      <p className="mt-2 text-muted">It may have been renamed or retired.</p>
      <Button className="mt-6" render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
