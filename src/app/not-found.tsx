import Link from 'next/link';

import { Button } from '@/components/ui/button';

// Header and footer come from the root layout — adding them here would draw
// each of them twice.
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold text-brand">
        We could not find that page
      </h1>
      <p className="mt-2 text-muted">
        The link may be old, or the product may have sold out.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
