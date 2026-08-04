import Link from 'next/link';

import type { Category } from '@/lib/types';

const HELP_LINKS = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Razorpay asks to see real Privacy, Terms, Refund/Cancellation and Shipping
 * pages before it will activate live payments. These routes exist now so the
 * footer has nowhere to 404, but the content has to be written before Phase 8
 * — finding out in the last week that payments cannot go live would be a bad
 * week.
 */
const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy', href: '/refunds' },
];

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-heading text-lg font-bold text-brand">Bolti Rakhi</p>
            <p className="mt-2 text-sm text-muted">
              A rakhi that carries your voice. Record a message, we print a QR on
              the packaging, and your brother watches it when he opens the box.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Shop</p>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/rakhi/${category.slug}`}
                    className="text-muted transition-colors hover:text-brand"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Help</p>
            <ul className="mt-3 space-y-2 text-sm">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Legal</p>
            <ul className="mt-3 space-y-2 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
          © {new Date().getFullYear()} Bolti Rakhi. Made in India.
        </p>
      </div>
    </footer>
  );
}
