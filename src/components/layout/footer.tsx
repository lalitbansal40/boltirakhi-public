import Link from 'next/link';

import {
  ADDRESS_LINES,
  GST_NUMBER,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_HREF,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_HREF,
} from '@/lib/business';
import type { Category } from '@/lib/types';

const HELP_LINKS = [
  { label: 'All rakhis', href: '/rakhi' },
  { label: 'Shipping', href: '/shipping' },
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
            <p className="font-heading text-lg font-bold text-brand">{LEGAL_NAME}</p>
            <p className="mt-2 text-sm text-muted">
              A rakhi that carries your voice. Record a message, we print a QR on
              the packaging, and your brother watches it when he opens the box.
            </p>

            {/*
              A real address, a real number and a GSTIN, on every page.
              Payment gateways check for exactly this before they let a shop go
              live, and a customer deciding whether to trust a name they have
              never heard of looks for the same three things.
            */}
            <address className="mt-4 text-sm not-italic text-muted">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <p className="mt-3 text-sm">
              <a href={SUPPORT_PHONE_HREF} className="text-muted hover:text-brand">
                {SUPPORT_PHONE_DISPLAY}
              </a>
              <br />
              <a href={SUPPORT_EMAIL_HREF} className="text-muted hover:text-brand">
                {SUPPORT_EMAIL}
              </a>
            </p>

            <p className="mt-3 text-sm text-muted">GSTIN: {GST_NUMBER}</p>
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
          © {new Date().getFullYear()} {LEGAL_NAME}. Made in India.
        </p>
      </div>
    </footer>
  );
}
