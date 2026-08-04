'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCart } from '@/components/cart/cart-provider';
import { Button } from '@/components/ui/button';

/**
 * The only client component on the product page.
 *
 * The page around it stays server-rendered — that is what puts the title,
 * description and price in the HTML source where Google can read them, and it
 * was the whole point of the last phase. One button does not need to cost that.
 */
export function AddToCartButton({
  productId,
  title,
  inStock,
}: {
  productId: string;
  title: string;
  inStock: boolean;
}) {
  const { add, isReady } = useCart();

  /** Two seconds of "Added" so the press is visibly acknowledged. */
  const [justAdded, setJustAdded] = useState(false);

  if (!inStock) {
    return (
      <Button size="lg" className="w-full sm:w-auto" disabled>
        Out of stock
      </Button>
    );
  }

  function handleAdd() {
    add(productId);
    setJustAdded(true);
    // A toast as well as the button state: on a phone the button is often
    // under a thumb at the moment it changes.
    toast.success(`${title} added to cart`);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      onClick={handleAdd}
      // Disabled until localStorage has been read. Adding before then would
      // start from an empty cart and wipe whatever was already in it.
      disabled={!isReady}
    >
      {justAdded ? (
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
  );
}
