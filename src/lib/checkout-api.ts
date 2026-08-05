import type { Address } from '@/lib/account-api';
import type { CartLine } from '@/lib/cart-storage';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface PaymentStatus {
  mode: 'test' | 'live';
  configured: boolean;
  /** The declared mode and the key disagree — never let this pass silently. */
  mismatch: boolean;
}

export interface CreatedOrder {
  orderId: string;
  orderNumber: string;
  amount: { totalPaise: number; currency: string };
  razorpayOrderId: string;
}

export interface OrderView {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paidAt: string | null;
  placedAt: string;
  hasBolti: boolean;
  /** Tokens for this order's Bolti messages, so the page can link to them. */
  boltiTokens?: string[];
  items: {
    title: string;
    slug: string;
    image?: string;
    pricePaise: number;
    qty: number;
    /** "Pack of 4". Absent on singles and on every pre-packs order. */
    packLabel?: string;
    type: 'normal' | 'bolti';
  }[];
  amount: {
    subtotalPaise: number;
    shippingPaise: number;
    discountPaise: number;
    totalPaise: number;
    currency: string;
  };
  shippingAddress: Omit<Address, 'id' | 'isDefault' | 'label'>;
  tracking: { awb: string | null; courierName: string | null; trackingUrl: string | null };
}

export class CheckoutError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string; code?: string } }
    | null;

  if (!response.ok) {
    throw new CheckoutError(
      payload?.error?.message ?? 'Something went wrong. Please try again.',
      response.status,
      payload?.error?.code,
    );
  }

  return payload?.data as T;
}

export function getPaymentStatus() {
  return call<PaymentStatus>('/orders/payment-status');
}

/**
 * Create the order and its Razorpay counterpart.
 *
 * The address is sent in full, not as an id: the order stores a copy, so that
 * a past order still shows where it actually went after the customer edits or
 * deletes the saved address.
 */
export function createOrder(input: {
  lines: CartLine[];
  address: Address;
  couponCode?: string;
  customerEmail?: string;
}) {
  const { id, isDefault, label, ...shippingAddress } = input.address;
  void id;
  void isDefault;
  void label;

  return call<CreatedOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      // Straight from the cart, not from the priced response — that one also
      // carries lines flagged as unavailable.
      // `packSize` is listed explicitly. Dropping it here would place the
      // order at single prices and ship one rakhi where a box was paid for,
      // and nothing before the parcel arrives would say so.
      items: input.lines.map((line) => ({
        productId: line.productId,
        packSize: line.packSize,
        qty: line.qty,
      })),
      shippingAddress,
      // Omitting this would charge the customer the undiscounted total.
      couponCode: input.couponCode,
      // Optional. No email simply means no receipt — the SMS still goes.
      customerEmail: input.customerEmail || undefined,
    }),
  });
}

export function verifyPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  return call<{ orderNumber: string; status: string }>('/orders/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getOrder(orderNumber: string) {
  return call<{ order: OrderView }>(`/orders/${encodeURIComponent(orderNumber)}`);
}

export interface OrderListRow {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  placedAt: string;
  totalPaise: number;
  itemCount: number;
  firstItemTitle: string | null;
  firstItemImage: string | null;
  /** Just the flag; the recorder token lives on the detail page. */
  hasBolti: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** This customer's own orders. The server filters by user; nothing here does. */
export function listOrders(page = 1, limit = 10) {
  return call<Paginated<OrderListRow>>(`/orders?page=${page}&limit=${limit}`);
}
