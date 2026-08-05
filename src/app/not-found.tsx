import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/catalog';

// Header and footer come from the root layout — adding them here would draw
// each of them twice.

/**
 * A way out, not a wall.
 *
 * Somebody reaching this followed a link that no longer works, and "we could
 * not find that page" on its own asks them to find their own way back. The
 * categories are the way back, so they are on the page.
 *
 * The `?? []` matters as much here as in the layout: a 404 that itself throws
 * because the API is down is the worst version of this page.
 */
export default async function NotFound() {
  const categories = (await getCategories().catch(() => null)) ?? [];

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold text-brand">
        We could not find that page
      </h1>
      <p className="mt-2 text-muted">
        The link may be old, or the product may have sold out.
      </p>

      {categories.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-medium text-ink">Have a look at these instead</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category._id}
                variant="outline"
                render={<Link href={`/rakhi/${category.slug}`}>{category.name}</Link>}
              />
            ))}
          </div>
        </div>
      )}

      <Button className="mt-6" render={<Link href="/">Back to home</Link>} />
    </div>
  );
}
