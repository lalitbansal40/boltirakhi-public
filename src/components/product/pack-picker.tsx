'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCart } from '@/components/cart/cart-provider';
import { Button } from '@/components/ui/button';
import { formatPaise } from '@/lib/money';
import type { PackVariant } from '@/lib/types';

/** What the picker offers: a single, then whatever packs the product sells. */
interface PackOption {
  packSize: number;
  pricePaise: number;
  savingPaise: number;
  inStock: boolean;
}

/**
 * Pack choice and "add to cart", together.
 *
 * They are one component on purpose. The chosen pack has to reach the button,
 * and the page around them is a server component — splitting them would mean
 * lifting the selection into a third client wrapper that does nothing else.
 */
export function PackPicker({
  productId,
  title,
  pricePaise,
  inStock,
  variants,
}: {
  productId: string;
  title: string;
  /** The single price. Packs carry their own. */
  pricePaise: number;
  inStock: boolean;
  variants?: PackVariant[];
}) {
  /**
   * The single is built here, not sent by the server: it is the product's own
   * price and has no variant row behind it.
   */
  const options: PackOption[] = [
    { packSize: 1, pricePaise, savingPaise: 0, inStock },
    ...(variants ?? []).map((variant) => ({
      packSize: variant.packSize,
      pricePaise: variant.pricePaise,
      savingPaise: variant.savingPaise,
      inStock: variant.inStock,
    })),
  ];

  const searchParams = useSearchParams();

  /**
   * `?pack=4` so a pack can be linked to directly — from an ad, or from a
   * customer sending their sister the exact thing they meant.
   *
   * Checked against the real options: `?pack=3` is not a pack this shop sells,
   * and anybody can type it.
   */
  const requested = Number(searchParams.get('pack'));
  const linked = options.find((option) => option.packSize === requested && option.inStock);

  const [packSize, setPackSize] = useState(linked?.packSize ?? 1);
  const selected = options.find((option) => option.packSize === packSize) ?? options[0];

  const { add, isReady } = useCart();
  /** Two seconds of "Added" so the press is visibly acknowledged. */
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    add(productId, selected.packSize, 1);
    setJustAdded(true);
    // A toast as well as the button state: on a phone the button is often
    // under a thumb at the moment it changes.
    toast.success(
      selected.packSize > 1
        ? `${title} — pack of ${selected.packSize} added to cart`
        : `${title} added to cart`,
    );
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/*
        One product, one price, no picker. Most of the shop is like this, and a
        lone "Single" button would only make the page look unfinished.
      */}
      {options.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Choose a pack</legend>

          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const isSelected = option.packSize === selected.packSize;

              return (
                <button
                  key={option.packSize}
                  type="button"
                  // Sold-out packs stay on the page, greyed out. Hiding them
                  // reads as "this shop does not do packs of eight" — the
                  // customer would never think to come back for one.
                  disabled={!option.inStock}
                  aria-pressed={isSelected}
                  onClick={() => setPackSize(option.packSize)}
                  className={`min-h-11 min-w-28 rounded-[var(--radius-input)] border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'border-brand bg-accent-soft/60'
                      : 'border-line hover:border-brand active:scale-[0.98] disabled:hover:border-line'
                  }`}
                >
                  <span className="block text-sm font-medium text-ink">
                    {option.packSize === 1 ? 'Single' : `Pack of ${option.packSize}`}
                  </span>
                  <span className="block text-sm text-ink">
                    {formatPaise(option.pricePaise)}
                  </span>

                  {/*
                    The saving, spelled out per pack.
                    A row of prices with no comparison gives nobody a reason to
                    pick the bigger box, and the whole feature stops earning
                    anything. The number comes from the server so it can never
                    disagree with what the cart charges.
                  */}
                  {!option.inStock ? (
                    <span className="block text-xs text-muted">Out of stock</span>
                  ) : option.savingPaise > 0 ? (
                    <span className="block text-xs font-medium text-brand">
                      Save {formatPaise(option.savingPaise)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={handleAdd}
        // Disabled until localStorage has been read. Adding before then would
        // start from an empty cart and wipe whatever was already in it.
        disabled={!isReady || !selected.inStock}
      >
        {!selected.inStock ? (
          'Out of stock'
        ) : justAdded ? (
          <>
            <Check className="size-4" aria-hidden />
            Added
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" aria-hidden />
            Add to cart
          </>
        )}
      </Button>
    </div>
  );
}

/** Matches the picker's height so the page does not jump as it hydrates. */
export function PackPickerSkeleton() {
  return <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-accent-soft/40" />;
}
