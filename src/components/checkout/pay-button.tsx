'use client';

import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { useCart } from '@/components/cart/cart-provider';
import { Button } from '@/components/ui/button';
import type { Address } from '@/lib/account-api';
import {
  CheckoutError,
  createOrder,
  verifyPayment,
  type CreatedOrder,
  type PaymentStatus,
} from '@/lib/checkout-api';

/**
 * Razorpay's checkout is injected by their script and has no types shipped
 * with it. Declared here rather than scattering `any` through the file.
 */
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export function PayButton({
  address,
  status,
  disabled,
}: {
  address: Address | null;
  status: PaymentStatus | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, pricing, couponCode, clear } = useCart();

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * The order Razorpay was opened for.
   *
   * Kept so a retry reuses it. Creating a fresh order on every attempt would
   * leave one payment attached to two orders and take stock off twice.
   */
  const [pending, setPending] = useState<CreatedOrder | null>(null);

  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  // Payments are switched off unless the server says a key pair is loaded and
  // the browser has its public key. A button that opens nothing is worse than
  // one that explains itself.
  const payable = Boolean(status?.configured && key && address && !disabled);

  function openRazorpay(order: CreatedOrder) {
    if (!window.Razorpay || !key) {
      setError('Payment could not start. Please refresh and try again.');
      setBusy(false);
      return;
    }

    const checkout = new window.Razorpay({
      // Public key id only. The secret signs and verifies, and anything that
      // can sign can forge a payment — it never leaves the server.
      key,
      order_id: order.razorpayOrderId,
      amount: order.amount.totalPaise,
      currency: order.amount.currency,
      name: 'Bolti Rakhi',
      description: `Order ${order.orderNumber}`,
      prefill: { contact: user?.phone ?? '', name: address?.name ?? '' },
      theme: { color: '#b4322e' },

      handler: async (response: RazorpayResponse) => {
        setNote('Confirming your payment…');
        try {
          await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          // Cleared only now. Emptying it earlier would leave a customer whose
          // payment failed with neither an order nor the cart they built.
          clear();
          // replace, so Back does not return to a payment already made.
          router.replace(`/order/${order.orderNumber}`);
        } catch {
          /**
           * Never "payment failed" — the money may well have been taken. The
           * webhook is the reliable signal and will settle this within
           * moments, so the honest message is that we are still confirming.
           */
          setNote(null);
          setError(
            'We are confirming your payment. If it went through, your order will appear shortly.',
          );
          setBusy(false);
        }
      },

      modal: {
        // Without this the page sits on "Opening payment…" forever after the
        // customer closes the window.
        ondismiss: () => {
          setBusy(false);
          setNote('Payment was not completed. Your order is saved — you can try again.');
        },
      },
    });

    checkout.open();
  }

  async function handlePay() {
    setError(null);
    setNote(null);
    setBusy(true);

    // A retry reopens the order that already exists.
    if (pending) {
      openRazorpay(pending);
      return;
    }

    try {
      const order = await createOrder({
        lines,
        address: address!,
        couponCode: couponCode ?? undefined,
      });
      setPending(order);
      openRazorpay(order);
    } catch (caught) {
      setError(
        caught instanceof CheckoutError
          ? caught.message
          : 'Could not start the payment. Please try again.',
      );
      setBusy(false);
    }
  }

  return (
    <>
      {/* Loaded on this page only, and lazily — every other page would pay for
          a script it never uses. */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={handlePay}
        disabled={!payable || busy || !pricing}
      >
        {busy ? 'Opening payment…' : pending ? 'Try payment again' : 'Pay now'}
      </Button>

      {!status?.configured && (
        <p className="mt-2 text-center text-sm text-muted">
          Online payment is not switched on yet.
        </p>
      )}
      {status?.configured && !key && (
        <p className="mt-2 text-center text-sm text-destructive">
          Payment key missing on this site. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.
        </p>
      )}
      {note && <p className="mt-2 text-center text-sm text-ink">{note}</p>}
      {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
    </>
  );
}
