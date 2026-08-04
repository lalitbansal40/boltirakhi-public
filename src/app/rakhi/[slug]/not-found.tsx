import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * The `noindex` below is what actually protects the site.
 *
 * notFound() renders the right page but leaves the response at 200. A dynamic
 * route streams its headers before the call resolves, and only making the
 * route static changes that — which searchParams rule out, since the filters
 * live in the URL. Four other explanations were tested and ruled out first.
 *
 * A crawler reads the status line, so at 200 it would treat every mistyped or
 * retired category URL as a real page and index it. `noindex` is obeyed
 * regardless of status, which removes the actual harm. The status is still
 * wrong and still worth fixing; this stops it from costing anything meanwhile.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
