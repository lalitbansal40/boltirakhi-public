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
import { NAV_CATEGORIES } from '@/lib/placeholder';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-md p-2 text-ink hover:bg-accent-soft lg:hidden"
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
            {NAV_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/rakhi/${category.slug}`}
                  // Closing on tap: without this the drawer stays open over the
                  // page the visitor just asked for.
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-ink hover:bg-accent-soft"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
