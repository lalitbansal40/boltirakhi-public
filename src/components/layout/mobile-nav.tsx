'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { Category } from '@/lib/types';

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-md p-2 text-ink transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 active:bg-accent-soft/70 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        }
      />

      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-heading text-brand">Bolti Rakhi</SheetTitle>
        </SheetHeader>

        <nav aria-label="Categories" className="mt-4 px-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/rakhi"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 font-medium text-ink hover:bg-accent-soft"
              >
                All rakhis
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category._id}>
                <Link
                  href={`/rakhi/${category.slug}`}
                  // Closing on tap: without this the drawer stays open over the
                  // page the visitor just asked for.
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-ink hover:bg-accent-soft"
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
      </SheetContent>
    </Sheet>
  );
}
