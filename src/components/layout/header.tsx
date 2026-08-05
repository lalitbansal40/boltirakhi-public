'use client';

import { Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { useCart } from '@/components/cart/cart-provider';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Input } from '@/components/ui/input';
import type { Category } from '@/lib/types';

function SearchForm({ className }: { className?: string }) {
  return (
    // A plain GET form, so search works before any JavaScript has loaded —
    // which on a slow phone is the first few seconds of every visit.
    <form role="search" action="/search" method="get" className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          placeholder="Search rakhi, combos, chocolates…"
          aria-label="Search products"
          className="pl-9"
        />
      </div>
    </form>
  );
}

export function Header({ categories }: { categories: Category[] }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const { itemCount, isReady } = useCart();
  const { isSignedIn } = useAuth();

  /**
   * Still null until localStorage has actually been read — not 0.
   *
   * The count lives in localStorage, which the server cannot see. If the server
   * rendered a 0 and the browser then rendered a 3, React would report a
   * hydration mismatch. No badge at all until there is a real number.
   */
  const cartCount: number | null = isReady && itemCount > 0 ? itemCount : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <MobileNav categories={categories} />

        <Link
          href="/"
          className="font-heading text-xl font-bold text-brand sm:text-2xl"
        >
          Bolti Rakhi
        </Link>

        <nav aria-label="Categories" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-5 text-sm">
            {/*
              "All rakhis" first, and it is the only entry that shows the whole
              catalogue. Without it every route into the shop lands in a
              category holding a third of it, and the shop looks smaller than
              it is.
            */}
            <li>
              <Link href="/rakhi" className="font-medium text-ink hover:text-brand">
                All rakhis
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category._id}>
                {/* A nav link is a link, not a button. */}
                <Link
                  href={`/rakhi/${category.slug}`}
                  className="text-ink transition-colors hover:text-brand"
                >
                  {category.name}
                  {typeof category.productCount === 'number' && (
                    <span className="ml-1 text-muted">({category.productCount})</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <SearchForm className="ml-auto hidden max-w-xs flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          {/* On a 375px screen the logo, a search box and the icons cannot
              share one row, so search collapses to a toggle. */}
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            className="rounded-md p-2 text-ink hover:bg-accent-soft md:hidden"
          >
            <Search className="size-5" aria-hidden />
          </button>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-md p-2 text-ink hover:bg-accent-soft"
          >
            <ShoppingBag className="size-5" aria-hidden />
            {cartCount !== null && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-medium text-brand-fg">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Points at the account once there is one to point at. Until the
              session check comes back it stays on /login rather than flickering
              between the two on every page load. */}
          <Link
            href={isSignedIn ? '/account' : '/login'}
            aria-label={isSignedIn ? 'Your account' : 'Sign in'}
            className="rounded-md p-2 text-ink hover:bg-accent-soft"
          >
            <User className="size-5" aria-hidden />
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <SearchForm />
        </div>
      )}
    </header>
  );
}
