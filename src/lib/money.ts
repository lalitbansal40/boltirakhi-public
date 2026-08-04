/**
 * Every money value crossing the API is whole paise: 49900 means Rs 499.
 *
 * These functions are the only place that conversion happens. Doing it inline
 * somewhere is how a price ends up 100x wrong.
 */

/** Paise to a display string: 49900 -> "₹499", 129950 -> "₹1,299.50" */
export function formatPaise(paise: number | null | undefined): string {
  const value = Number.isFinite(paise) ? (paise as number) : 0;

  // Show decimals only when there are any, but show both digits when there
  // are — "₹1,299.5" reads like a truncated number.
  const fractionDigits = value % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

/** Paise to a bare number string for a form input: 49900 -> "499", 4990 -> "49.90" */
export function paiseToRupeeInput(paise: number | null | undefined): string {
  if (!Number.isFinite(paise)) return '';

  const value = paise as number;
  return value % 100 === 0 ? String(value / 100) : (value / 100).toFixed(2);
}

/**
 * Form input to paise: "499" -> 49900, "49.9" -> 4990.
 *
 * Parsed digit by digit rather than multiplied by 100. `49.9 * 100` is
 * 4989.999... and `1.005 * 100` is 100.4999..., so float arithmetic silently
 * loses a paisa — and the backend rejects anything that is not an integer.
 */
export function rupeesToPaise(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === '') return 0;

  // Numbers go through their string form so the same exact path is used.
  const cleaned = String(input).replace(/[^\d.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return 0;

  const negative = cleaned.startsWith('-');
  const [wholePart = '0', fractionPart = ''] = cleaned.replace('-', '').split('.');

  const whole = Number(wholePart || '0');
  if (!Number.isFinite(whole)) return 0;

  // Two digits of paise, with the third deciding whether to round up.
  const paiseDigits = fractionPart.padEnd(3, '0').slice(0, 3);
  const paise = Number(paiseDigits.slice(0, 2));
  const roundUp = Number(paiseDigits[2]) >= 5 ? 1 : 0;

  const total = whole * 100 + paise + roundUp;
  return negative ? -total : total;
}

/**
 * Discount as a whole percent, or null when it cannot be shown.
 *
 * Both arguments are paise, so the units cancel — this is a ratio, not a
 * rupee conversion. It lives here anyway so `lib/money.ts` stays the only file
 * that does arithmetic on money.
 */
export function percentOff(pricePaise: number, mrpPaise: number): number | null {
  if (!Number.isFinite(pricePaise) || !Number.isFinite(mrpPaise)) return null;
  if (mrpPaise <= 0 || pricePaise <= 0 || pricePaise > mrpPaise) return null;

  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}

/** Plain number with Indian grouping, for counts rather than money. */
export function formatNumber(value: number | null | undefined): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value as number);
}
