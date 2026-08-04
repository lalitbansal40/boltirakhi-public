/**
 * The cart, as it survives a refresh.
 *
 * Only product ids and quantities are kept — never a price, never a title.
 * A cart can sit in a browser for months; a price stored alongside it would be
 * a lie long before anyone came back to it. Everything shown on screen is
 * fetched fresh from /api/cart/price.
 */

const KEY = 'br_cart_v1';

/**
 * A cart this long is not a shopper, it is a script. The server rejects more
 * than 50 lines anyway, so refusing here keeps the two in step.
 */
const MAX_LINES = 50;

/** The server caps quantity at 20 per line. Same limit, same reason. */
const MAX_QTY = 20;

export interface CartLine {
  productId: string;
  qty: number;
}

interface StoredCart {
  /**
   * Schema version.
   *
   * When this shape changes, an old cart is thrown away rather than migrated —
   * a stale cart is a minor annoyance, a crash on load is not.
   */
  v: 1;
  lines: CartLine[];
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === 'string' &&
    line.productId.length > 0 &&
    typeof line.qty === 'number' &&
    Number.isInteger(line.qty) &&
    line.qty > 0
  );
}

/**
 * Read the cart.
 *
 * Callers must only run this in the browser — see the note in `writeCart`.
 * Anything unrecognised is treated as an empty cart, not an error: whatever is
 * in localStorage came from a previous version of this site, another tab, or a
 * user poking at devtools, and none of those should be able to break the page.
 */
export function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return [];

    const cart = parsed as Partial<StoredCart>;
    if (cart.v !== 1 || !Array.isArray(cart.lines)) return [];

    return cart.lines.filter(isCartLine).slice(0, MAX_LINES);
  } catch {
    // Quota errors, private-browsing restrictions, corrupt JSON. None of them
    // are worth taking the site down over.
    return [];
  }
}

/**
 * Write the cart.
 *
 * `window` does not exist while Next renders on the server, and touching it at
 * module scope would break the build. Every call sits behind an event handler
 * or an effect, but the guard stays as a backstop.
 */
export function writeCart(lines: CartLine[]): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: StoredCart = { v: 1, lines: lines.slice(0, MAX_LINES) };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Safari in private mode throws on every write. The cart still works for
    // this visit; it just will not survive a refresh.
  }
}

/**
 * Add to the cart, or raise the quantity if it is already in there.
 *
 * Pressing "add" twice means two of the same thing, not two separate lines —
 * two identical rows in a cart look like a bug to the person reading them.
 */
export function addLine(lines: CartLine[], productId: string, qty = 1): CartLine[] {
  const existing = lines.find((line) => line.productId === productId);

  if (existing) {
    return lines.map((line) =>
      line.productId === productId
        ? { ...line, qty: Math.min(line.qty + qty, MAX_QTY) }
        : line,
    );
  }

  if (lines.length >= MAX_LINES) return lines;

  return [...lines, { productId, qty: Math.min(qty, MAX_QTY) }];
}

/** Setting a quantity to zero removes the line — that is what a stepper at 0 means. */
export function setQty(lines: CartLine[], productId: string, qty: number): CartLine[] {
  if (qty <= 0) return removeLine(lines, productId);

  return lines.map((line) =>
    line.productId === productId ? { ...line, qty: Math.min(qty, MAX_QTY) } : line,
  );
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export { MAX_QTY };
