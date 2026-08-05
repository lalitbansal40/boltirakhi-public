import type { CartLine } from '@/lib/cart-storage';

/**
 * Cart pricing, from the browser.
 *
 * Every number the cart shows comes from here. Nothing is added up on the
 * client — the total on screen has to be the total that gets charged, and the
 * only way to be sure of that is for both to come from the same server code.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/** Why a line cannot be supplied as asked. */
export type LineIssue = 'unavailable' | 'insufficient_stock';

export interface PricedCartLine {
  productId: string;
  title: string;
  slug: string;
  image?: string;
  /** The price of one pack, not of one rakhi. */
  pricePaise: number;
  qty: number;
  /** 1 for a single. Absent on nothing — the server always sends it. */
  packSize?: number;
  /** "Pack of 4". Server-worded so the cart and the invoice never disagree. */
  packLabel?: string;
  type: 'normal' | 'bolti';
  /** Zero when the line has an issue, so it never lands in the total. */
  lineTotalPaise: number;
  issue?: LineIssue;
  /** Packs left, not rakhis — "only 2 left" means two boxes. */
  availableQty?: number;
  /**
   * The packs this product sells right now, smallest first, always with 1.
   * The cart's pack switcher is built from this rather than from a fixed list,
   * so it can never offer a pack the order endpoint would reject.
   */
  availablePacks?: number[];
}

export interface PricedCart {
  lines: PricedCartLine[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  freeDeliveryAbovePaise: number;
  /** A rejected coupon arrives here, not as a failed request. */
  couponError?: string;
}

export async function priceCart(
  lines: CartLine[],
  couponCode: string | undefined,
  signal?: AbortSignal,
): Promise<PricedCart> {
  const response = await fetch(`${BASE}/cart/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: lines, couponCode }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Could not work out the cart total');
  }

  const payload = (await response.json()) as { data: PricedCart };
  return payload.data;
}
