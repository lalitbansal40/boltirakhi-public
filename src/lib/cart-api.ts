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
  pricePaise: number;
  qty: number;
  type: 'normal' | 'bolti';
  /** Zero when the line has an issue, so it never lands in the total. */
  lineTotalPaise: number;
  issue?: LineIssue;
  /** Only present when fewer are left than were asked for. */
  availableQty?: number;
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
