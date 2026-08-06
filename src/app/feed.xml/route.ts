import { getProducts } from '@/lib/catalog';
import type { Product } from '@/lib/types';

/**
 * The Google Merchant Center product feed.
 *
 * Served from our own domain rather than uploaded as a file, so Merchant
 * Center re-fetches it on a schedule and a rakhi added in the admin appears in
 * Google without anybody exporting a spreadsheet.
 *
 * ── What is deliberately NOT in here ──────────────────────────────────
 *
 * Multi-packs. Every pack shares the single's photographs and differs only in
 * the number in its title, and a brand-new Merchant account is reviewed by
 * hand — near-identical items are the fastest way to have the whole account
 * flagged rather than one item. Singles get approved first; packs can be added
 * afterwards as an `item_group_id` family, on an account with a record.
 *
 * Shipping is also absent on purpose. Delivery here is free above a threshold,
 * which a per-item feed field cannot express. It belongs in the Merchant
 * Center account's shipping settings, where a rule can.
 *
 * `g:price` carries the price a shopper actually pays, with no `g:sale_price`
 * alongside it. Sending the MRP as the price and the real figure as a sale is
 * the usual way to get a struck-through number in Shopping, and the usual way
 * to be disapproved: Google compares the feed against the landing page, and
 * disagreement between the two is the commonest reason an item is pulled.
 *
 * `g:identifier_exists` is `no` because these are handmade and carry no
 * barcode. Saying so is required — staying quiet is itself an error.
 */

const SITE = 'https://boltirakhi.com';

/** The catalogue endpoint caps a page at this, so it is the stride to walk. */
const PAGE_SIZE = 48;

/**
 * Google's own taxonomy, not ours. A rakhi is worn on the wrist, and this is
 * the closest branch — leaving it out makes Google guess, and a wrong guess
 * puts the item in front of the wrong shoppers.
 */
const GOOGLE_CATEGORY = 'Apparel & Accessories > Jewelry > Bracelets';

/** An hour. New rakhis appear within one, and Google is not fetching faster. */
export const revalidate = 3600;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Feed descriptions are plain text — no markup, no line breaks that matter.
 * Google truncates at 5000 characters; ours are nowhere near, but a product
 * written later might be.
 */
function plain(text: string): string {
  return esc(text.replace(/\s+/g, ' ').trim()).slice(0, 5000);
}

/**
 * Rupees with two decimals, as Google wants it.
 *
 * This is the one place outside money.ts that divides by 100, and it has to:
 * the feed format is a decimal string, not paise.
 */
function feedPrice(paise: number): string {
  return `${(paise / 100).toFixed(2)} INR`;
}

async function allProducts(): Promise<Product[]> {
  const products: Product[] = [];
  let page = 1;

  for (;;) {
    const result = await getProducts({ page, limit: PAGE_SIZE }).catch(() => null);
    if (!result) break;

    products.push(...result.items);
    if (!result.hasNext) break;
    page += 1;
  }

  return products;
}

function itemFor(product: Product): string {
  const categoryName =
    typeof product.categoryId === 'string' ? '' : product.categoryId.name;

  const [primary, ...rest] = product.images ?? [];

  // An item with no photograph is rejected, and one rejection on a new account
  // counts against the whole feed. Skipped upstream rather than sent.
  if (!primary) return '';

  return `    <item>
      <g:id>${esc(product.slug)}</g:id>
      <g:title>${plain(product.title)}</g:title>
      <g:description>${plain(product.shortDescription || product.description)}</g:description>
      <g:link>${SITE}/product/${esc(product.slug)}</g:link>
      <g:image_link>${esc(primary.url)}</g:image_link>
${rest
  .slice(0, 10)
  .map((image) => `      <g:additional_image_link>${esc(image.url)}</g:additional_image_link>`)
  .join('\n')}
      <g:availability>${product.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${feedPrice(product.pricePaise)}</g:price>
      <g:brand>Bolti Rakhi</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${esc(GOOGLE_CATEGORY)}</g:google_product_category>
${categoryName ? `      <g:product_type>${esc(categoryName)}</g:product_type>` : ''}
    </item>`;
}

export async function GET() {
  const products = await allProducts();
  const items = products.map(itemFor).filter(Boolean).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Bolti Rakhi</title>
    <link>${SITE}</link>
    <description>Rakhis that carry a recorded video message, with a QR code printed on the packaging.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
