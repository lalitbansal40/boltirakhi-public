/**
 * The backend's public contract, kept by hand — the two repos are separate, so
 * when an API changes it changes here too.
 *
 * Money keeps its `Paise` suffix everywhere. A field named `price` invites
 * someone to render it as rupees and be a hundred times wrong.
 */

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Two shapes: validation failures send an array of field errors, rule
 * violations send a plain object of context. Narrow it with
 * `ApiClientError.fieldErrors` / `.detail()` rather than casting.
 */
export type ErrorDetails = FieldError[] | Record<string, unknown>;

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Codes the backend actually emits that this site has to react to. */
export const API_ERROR = {
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  COUPON_NOT_FOUND: 'COUPON_NOT_FOUND',
  COUPON_INACTIVE: 'COUPON_INACTIVE',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
  COUPON_MIN_ORDER: 'COUPON_MIN_ORDER',
  INTERNAL: 'INTERNAL_ERROR',
} as const;

// ---- catalogue ----

/**
 * No `key`. The storage key is internal and the public API strips it — a URL
 * is all a browser needs, and a field in the type is a field somebody
 * eventually reads and finds undefined.
 */
export interface StoredImage {
  url: string;
  alt?: string;
}

/** Added to Product in Phase 1 — a product may carry one. */
export interface StoredVideo {
  url: string;
  thumbUrl?: string;
  durationSec?: number;
}

export type ProductType = 'normal' | 'bolti';

/**
 * ⚠️ `sku`, `weightGrams`, `dimensionsCm` and the real `stock` count are
 * deliberately absent. They are internal, the public API will not send them,
 * and a field that exists in the type is a field somebody eventually renders.
 * Availability is a boolean and nothing more.
 */
/**
 * One multi-pack. `pricePaise` is the price of the whole box, not per rakhi.
 *
 * Availability is a boolean here too — a shopper never sees a stock count.
 */
export interface PackVariant {
  packSize: number;
  pricePaise: number;
  mrpPaise: number;
  /** What this box saves against the same number of singles. Server-computed. */
  savingPaise: number;
  inStock: boolean;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string | Pick<Category, '_id' | 'name' | 'slug'>;
  images: StoredImage[];
  video?: StoredVideo;
  pricePaise: number;
  mrpPaise: number;
  discountPercent?: number;
  inStock: boolean;
  /**
   * Multi-packs, if this product sells any. Absent or empty on most — they
   * sell as singles, and the picker stays off the page entirely.
   *
   * The server sends only the active ones, and `savingPaise` already worked
   * out. Recomputing it here would eventually disagree with the invoice.
   */
  variants?: PackVariant[];
  type: ProductType;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: StoredImage;
  description?: string;
  /** Active products in this category — sent by the list endpoint only. */
  productCount?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}
