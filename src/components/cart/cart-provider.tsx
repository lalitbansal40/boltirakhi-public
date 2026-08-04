'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { priceCart, type PricedCart } from '@/lib/cart-api';
import {
  addLine,
  countItems,
  readCart,
  removeLine,
  setQty,
  writeCart,
  type CartLine,
} from '@/lib/cart-storage';

/**
 * How long to wait after the last change before asking the server for a total.
 *
 * Long enough that tapping "+" four times is one request, short enough that
 * the total does not feel stuck.
 */
const DEBOUNCE_MS = 400;

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  pricing: PricedCart | null;
  /**
   * localStorage has been read. Until this is true the cart is empty because
   * nothing has been loaded yet — not because it is actually empty, and the UI
   * must not claim otherwise.
   */
  isReady: boolean;
  /** A pricing request is in flight. Separate from `isReady` on purpose. */
  isPricing: boolean;
  /** The pricing request failed — network down, backend restarting. */
  pricingFailed: boolean;
  couponCode: string | null;
  add: (productId: string, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  /**
   * Always starts empty, even if localStorage has a cart in it.
   *
   * The server renders this component's tree with no localStorage at all. If
   * the first client render disagreed with the server's, React would report a
   * hydration mismatch and throw the markup away. So: render empty, then fill
   * in an effect.
   */
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [pricing, setPricing] = useState<PricedCart | null>(null);
  const [isPricing, setIsPricing] = useState(false);
  const [pricingFailed, setPricingFailed] = useState(false);

  /**
   * The coupon is deliberately *not* stored in localStorage.
   *
   * It goes stale exactly like a price does — it can expire, be switched off,
   * or stop meeting its minimum order. Re-entering it is a small cost; showing
   * a discount that no longer exists is not.
   */
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Load once, on the client.
  useEffect(() => {
    setLines(readCart());
    setIsReady(true);
  }, []);

  // Persist every change, but not the empty state we started with.
  useEffect(() => {
    if (!isReady) return;
    writeCart(lines);
  }, [lines, isReady]);

  /**
   * Cancels the previous pricing request when a newer one starts.
   *
   * Without this, responses can land out of order — a slow reply for a cart of
   * 2 arriving after a fast reply for a cart of 3 would leave the wrong total
   * on screen, and it would look correct.
   */
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isReady) return;

    if (lines.length === 0) {
      abortRef.current?.abort();
      setPricing(null);
      setPricingFailed(false);
      return;
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsPricing(true);
      priceCart(lines, couponCode ?? undefined, controller.signal)
        .then((result) => {
          setPricing(result);
          setPricingFailed(false);
        })
        .catch((error: unknown) => {
          // An abort is this component cancelling its own work, not a failure.
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setPricingFailed(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsPricing(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [lines, couponCode, isReady]);

  const add = useCallback((productId: string, qty = 1) => {
    setLines((current) => addLine(current, productId, qty));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setLines((current) => setQty(current, productId, qty));
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((current) => removeLine(current, productId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCode(null);
  }, []);

  const applyCoupon = useCallback((code: string) => {
    setCouponCode(code.trim().toUpperCase());
  }, []);

  const removeCoupon = useCallback(() => setCouponCode(null), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: countItems(lines),
      pricing,
      isReady,
      isPricing,
      pricingFailed,
      couponCode,
      add,
      updateQty,
      remove,
      clear,
      applyCoupon,
      removeCoupon,
    }),
    [
      lines,
      pricing,
      isReady,
      isPricing,
      pricingFailed,
      couponCode,
      add,
      updateQty,
      remove,
      clear,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }

  return context;
}
