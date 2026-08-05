/**
 * The cart, as it survives a refresh.
 *
 * Only product ids, pack sizes and quantities are kept — never a price, never
 * a title. A cart can sit in a browser for months; a price stored alongside it
 * would be a lie long before anyone came back to it. Everything shown on
 * screen is fetched fresh from /api/cart/price.
 */

const KEY = 'br_cart_v2';

/**
 * The pre-packs cart, still read on the way in.
 *
 * Kept until roughly the end of August 2026. It is only ever read, never
 * written and never cleared: if the v2 shape turns out to be wrong, this is
 * the only copy of what people had actually put in their carts.
 */
const LEGACY_KEY = 'br_cart_v1';

/**
 * A cart this long is not a shopper, it is a script. The server rejects more
 * than 50 lines anyway, so refusing here keeps the two in step.
 */
const MAX_LINES = 50;

/** The server caps quantity at 20 per line. Same limit, same reason. */
const MAX_QTY = 20;

/**
 * The pack sizes the server will accept. Anything else is a 400, so a cart
 * carrying one is worth dropping here rather than at checkout.
 */
const PACK_SIZES = [1, 2, 4, 6, 8];

export interface CartLine {
  productId: string;
  /**
   * 1 means a single. Products with no packs, and every cart saved before
   * packs existed, live at 1.
   */
  packSize: number;
  /** Packs, not rakhis. `packSize: 4, qty: 2` is two boxes of four. */
  qty: number;
}

interface StoredCart {
  /**
   * Schema version.
   *
   * v1 is migrated rather than discarded — see `readLegacy`. Anything else
   * unrecognised is treated as an empty cart rather than an error.
   */
  v: 2;
  lines: CartLine[];
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === 'string' &&
    line.productId.length > 0 &&
    typeof line.packSize === 'number' &&
    PACK_SIZES.includes(line.packSize) &&
    typeof line.qty === 'number' &&
    Number.isInteger(line.qty) &&
    line.qty > 0
  );
}

/** Two lines are the same line only when the pack matches too. */
function isSame(line: CartLine, productId: string, packSize: number): boolean {
  return line.productId === productId && line.packSize === packSize;
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
    // No v2 yet does not mean no cart. Skipping this is how every basket that
    // was full before packs shipped would quietly come back empty — and nobody
    // reports an empty cart, they just leave.
    if (!raw) return readLegacy();

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return [];

    const cart = parsed as Partial<StoredCart>;
    if (cart.v !== 2 || !Array.isArray(cart.lines)) return [];

    return cart.lines.filter(isCartLine).slice(0, MAX_LINES);
  } catch {
    // Quota errors, private-browsing restrictions, corrupt JSON. None of them
    // are worth taking the site down over.
    return [];
  }
}

/**
 * The pre-packs cart: `{ v: 1, lines: [{ productId, qty }] }`.
 *
 * Every line becomes a single, which is exactly what it was — packs did not
 * exist when it was saved.
 */
function readLegacy(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return [];

    const cart = parsed as { v?: number; lines?: unknown };
    if (cart.v !== 1 || !Array.isArray(cart.lines)) return [];

    return cart.lines
      .map((line) =>
        typeof line === 'object' && line !== null ? { ...line, packSize: 1 } : line,
      )
      .filter(isCartLine)
      .slice(0, MAX_LINES);
  } catch {
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
    const payload: StoredCart = { v: 2, lines: lines.slice(0, MAX_LINES) };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Safari in private mode throws on every write. The cart still works for
    // this visit; it just will not survive a refresh.
  }
}

/**
 * Add to the cart, or raise the quantity if that exact pack is already in there.
 *
 * Pressing "add" twice means two of the same thing, not two separate lines —
 * two identical rows in a cart look like a bug to the person reading them.
 * A different pack of the same product is a different thing, and gets its own
 * row.
 */
export function addLine(
  lines: CartLine[],
  productId: string,
  packSize = 1,
  qty = 1,
): CartLine[] {
  const existing = lines.find((line) => isSame(line, productId, packSize));

  if (existing) {
    return lines.map((line) =>
      isSame(line, productId, packSize)
        ? { ...line, qty: Math.min(line.qty + qty, MAX_QTY) }
        : line,
    );
  }

  if (lines.length >= MAX_LINES) return lines;

  return [...lines, { productId, packSize, qty: Math.min(qty, MAX_QTY) }];
}

/** Setting a quantity to zero removes the line — that is what a stepper at 0 means. */
export function setQty(
  lines: CartLine[],
  productId: string,
  packSize: number,
  qty: number,
): CartLine[] {
  if (qty <= 0) return removeLine(lines, productId, packSize);

  return lines.map((line) =>
    isSame(line, productId, packSize) ? { ...line, qty: Math.min(qty, MAX_QTY) } : line,
  );
}

export function removeLine(
  lines: CartLine[],
  productId: string,
  packSize: number,
): CartLine[] {
  return lines.filter((line) => !isSame(line, productId, packSize));
}

/**
 * Switch a line to a different pack.
 *
 * The target pack may already be in the cart — somebody with a pack of two and
 * a pack of four who switches the two to a four means one row of six boxes,
 * not two rows of four. Leaving both would show the same product twice with no
 * visible difference between the rows.
 */
export function changePack(
  lines: CartLine[],
  productId: string,
  from: number,
  to: number,
): CartLine[] {
  if (from === to) return lines;

  const moving = lines.find((line) => isSame(line, productId, from));
  if (!moving) return lines;

  const target = lines.find((line) => isSame(line, productId, to));
  const without = removeLine(lines, productId, from);

  return target
    ? setQty(without, productId, to, target.qty + moving.qty)
    : [...without, { productId, packSize: to, qty: moving.qty }];
}

/**
 * What the header badge counts.
 *
 * Boxes, not rakhis. Two packs of eight is "2 items" — a badge reading "16"
 * over a cart showing two rows would look broken.
 */
export function countItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export { MAX_QTY, PACK_SIZES };
