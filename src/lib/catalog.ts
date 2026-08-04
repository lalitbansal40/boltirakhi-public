import type { Paginated, Product, Category } from './types';

/**
 * Catalogue reads, for server components.
 *
 * Plain fetch rather than the axios client: these run on the server, where
 * Next handles caching and deduplication, and axios sits outside all of that.
 * The axios instance stays for the browser — cart and checkout, from Phase 4.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * Five minutes.
 *
 * Not only for speed. Server-rendered pages all reach the API from one
 * machine, so every visitor shares a single rate-limit bucket of 120 requests
 * per fifteen minutes — without caching, a busy evening would 429 the whole
 * site for everyone at once. The catalogue changes a couple of times a day, so
 * five minutes of staleness costs nothing.
 */
const REVALIDATE_SECONDS = 300;

/** The catalogue's page size cap. */
const MAX_LIMIT = 48;

async function get<T>(path: string): Promise<T | null> {
  const response = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  // A 404 is an answer, not a failure: the page decides whether that means
  // notFound() or an empty section.
  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Catalogue request failed: ${path} (${response.status})`);
  }

  const body = (await response.json()) as { data: T };
  return body.data;
}

export interface ProductQuery {
  category?: string;
  type?: 'normal' | 'bolti';
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number | string;
  limit?: number | string;
}

/** Built with URLSearchParams so a slug with an odd character cannot break the URL. */
function toQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function getCategories(): Promise<Category[] | null> {
  return get<Category[]>('/categories');
}

export function getCategory(slug: string): Promise<Category | null> {
  return get<Category>(`/categories/${encodeURIComponent(slug)}`);
}

export function getProducts(query: ProductQuery = {}): Promise<Paginated<Product> | null> {
  return get<Paginated<Product>>(`/products${toQuery({ ...query })}`);
}

export function getProduct(slug: string): Promise<Product | null> {
  return get<Product>(`/products/${encodeURIComponent(slug)}`);
}

export function searchProducts(
  q: string,
  page?: number | string,
): Promise<Paginated<Product> | null> {
  return get<Paginated<Product>>(`/search${toQuery({ q, page })}`);
}

export { MAX_LIMIT, REVALIDATE_SECONDS };
