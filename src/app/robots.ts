import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Search results and the cart are for visitors, not the index. Every
      // query would otherwise become a thin page competing with the real ones.
      disallow: ['/search', '/cart', '/checkout', '/account'],
    },
    sitemap: 'https://boltirakhi.com/sitemap.xml',
  };
}
