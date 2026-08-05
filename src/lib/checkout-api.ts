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
  items: {
    title: string;
    slug: string;
    image?: string;
    pricePaise: number;
    qty: number;
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
      items: input.lines.map((line) => ({ productId: line.productId, qty: line.qty })),
      shippingAddress,
      // Omitting this would charge the customer the undiscounted total.
      couponCode: input.couponCode,
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
