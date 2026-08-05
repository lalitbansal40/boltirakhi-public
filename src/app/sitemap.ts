import type { MetadataRoute } from 'next';

import { getCategories, getProducts } from '@/lib/catalog';

const SITE = 'https://boltirakhi.com';

/** The catalogue endpoint caps a page at this, so it is the stride to walk. */
const PAGE_SIZE = 48;

/**
 * Walks every page of the catalogue rather than asking for one big list —
 * the API caps a request at 48 on purpose, and a sitemap that quietly stops
 * at the first 48 products would leave the rest uncrawled.
 */
async function allProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;

  for (;;) {
    const result = await getProducts({ page, limit: PAGE_SIZE }).catch(() => null);
    if (!result) break;

    slugs.push(...result.items.map((product) => product.slug));
    if (!result.hasNext) break;
    page += 1;
  }

  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productSlugs] = await Promise.all([
    getCategories().catch(() => null),
    allProductSlugs(),
  ]);

  const now = new Date();

  return [
    { url: SITE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    /**
     * The whole catalogue on one path, ranked just under the home page.
     *
     * This is the page that should win "rakhi online" — a category holds a
     * third of the shop, and pointing a search engine at one of those instead
     * shows a visitor a third of what we sell.
     */
    {
      url: `${SITE}/rakhi`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    // The pages a shopper checks before paying a name they do not know.
    ...['/about', '/contact', '/shipping', '/refunds', '/terms', '/privacy'].map(
      (path) => ({
        url: `${SITE}${path}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      }),
    ),
    ...(categories ?? []).map((category) => ({
      url: `${SITE}/rakhi/${category.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...productSlugs.map((slug) => ({
      url: `${SITE}/product/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
