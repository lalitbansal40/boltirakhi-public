'use client';

import { Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { MobileNav } from '@/components/layout/mobile-nav';
import { Input } from '@/components/ui/input';
import { NAV_CATEGORIES } from '@/lib/placeholder';

function SearchForm({ className }: { className?: string }) {
  return (
    <form
      role="search"
      className={className}
      // Wired up in Phase 2. Submitting now would navigate to a route that
      // does not exist yet.
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search rakhi, combos, chocolates…"
          aria-label="Search products"
          className="pl-9"
        />
      </div>
    </form>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  /**
   * null until the cart is real (Phase 4), not 0.
   *
   * The count will come from localStorage, which the server cannot see. If the
   * server rendered a 0 and the browser then rendered a 3, React would report
   * a hydration mismatch. Rendering no badge at all until there is a number
   * avoids inventing one.
   */
  const cartCount: number | null = null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <MobileNav />

        <Link
          href="/"
          className="font-heading text-xl font-bold text-brand sm:text-2xl"
        >
          Bolti Rakhi
        </Link>

        <nav aria-label="Categories" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-5 text-sm">
            {NAV_CATEGORIES.map((category) => (
              <li key={category.slug}>
                {/* A nav link is a link, not a button. */}
                <Link
                  href={`/rakhi/${category.slug}`}
                  className="text-ink transition-colors hover:text-brand"
                >
                  {category.name}
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

          <Link
            href="/login"
            aria-label="Account"
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
