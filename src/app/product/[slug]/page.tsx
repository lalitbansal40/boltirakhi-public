import { QrCode, ShieldCheck, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ProductGallery } from '@/components/catalog/product-gallery';
import { Badge } from '@/components/ui/badge';
import { PackPicker, PackPickerSkeleton } from '@/components/product/pack-picker';
import { LEGAL_NAME } from '@/lib/business';
import { getProduct } from '@/lib/catalog';
import { formatPaise } from '@/lib/money';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return {};

  // Falls back to the product's own title: not every one of the sixty-odd
  // products will have the SEO fields filled in, and an empty title is the
  // worst of the three outcomes.
  const title = product.metaTitle ?? product.title;

  return {
    title,
    description: product.metaDescription ?? product.shortDescription,
    openGraph: {
      title,
      description: product.metaDescription ?? product.shortDescription,
      // WhatsApp shows this when the link is shared, and a good share of the
      // traffic will arrive that way.
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = typeof product.categoryId === 'string' ? null : product.categoryId;

  /**
   * Structured data, which is what puts a price and an availability badge
   * under the result in Google rather than a bare blue link.
   *
   * ⚠️ The price here is in RUPEES, not paise — schema.org expects a decimal
   * amount, and 49900 would advertise this at forty-nine thousand rupees.
   * This is the one place in the codebase where dividing by 100 is correct.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription ?? product.description,
    image: product.images.map((image) => image.url),
    // Matches g:brand and g:id in the Merchant Center feed. Google compares the
    // feed against this markup, and a disagreement is a disapproved item.
    brand: { '@type': 'Brand', name: 'Bolti Rakhi' },
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (product.pricePaise / 100).toFixed(2),
      /**
       * Without this Google treats the price as valid forever and eventually
       * reports the offer as stale. Six months out, refreshed on every render,
       * so it never actually arrives.
       */
      priceValidUntil: new Date(Date.now() + 182 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `https://boltirakhi.com/product/${product.slug}`,
      seller: { '@type': 'Organization', name: LEGAL_NAME },
    },
  };

  /**
   * The trail Google prints under the link, in place of a bare URL.
   *
   * Kept separate from the product markup rather than nested inside it —
   * they are two different things Google reads, and one malformed field in a
   * combined blob invalidates both.
   */
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://boltirakhi.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All rakhis',
        item: 'https://boltirakhi.com/rakhi',
      },
      ...(category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: category.name,
              item: `https://boltirakhi.com/rakhi/${category.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: category ? 4 : 3,
        name: product.title,
        item: `https://boltirakhi.com/product/${product.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        // The object is built here from our own data, so there is nothing
        // user-supplied to escape.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} video={product.video} title={product.title} />

        <div className="space-y-5">
          {category && (
            <Link
              href={`/rakhi/${category.slug}`}
              className="text-sm text-brand underline-offset-4 hover:underline"
            >
              {category.name}
            </Link>
          )}

          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
            {product.title}
          </h1>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold text-brand">
              {formatPaise(product.pricePaise)}
            </span>
            {product.mrpPaise > product.pricePaise && (
              <>
                <span className="text-muted line-through">{formatPaise(product.mrpPaise)}</span>
                {product.discountPercent ? (
                  <Badge className="bg-brand text-brand-fg">{product.discountPercent}% off</Badge>
                ) : null}
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-muted">{product.shortDescription}</p>
          )}

          {product.type === 'bolti' && (
            <div className="space-y-2 rounded-[var(--radius-card)] bg-accent-soft/50 p-4">
              <p className="flex items-center gap-2 font-medium text-ink">
                <QrCode className="size-4 text-brand" aria-hidden />
                This one carries your voice
              </p>
              <p className="text-sm text-muted">
                After checkout you can record a video message. We print a QR code on the
                packaging, and your brother watches it when he opens the box. Recording it is
                optional — the rakhi arrives just the same without one.
              </p>

              {/*
                🔴 Said before the money, not after.
                One order carries one message, so a pack of four is four rakhis
                sharing a single video. Somebody who assumed four separate
                recordings finds out when the parcel arrives, and that is a
                complaint we would have written ourselves.
              */}
              {(product.variants?.length ?? 0) > 0 && (
                <p className="text-sm font-medium text-ink">
                  One message per pack — every rakhi in the box carries the same QR
                  code and plays the same video.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {/*
              `useSearchParams` reads `?pack=4`, and Next requires a Suspense
              boundary around that. Without one `next build` fails while `next
              dev` carries on working, so the mistake only surfaces on deploy.
            */}
            <Suspense fallback={<PackPickerSkeleton />}>
              <PackPicker
                productId={product._id}
                title={product.title}
                pricePaise={product.pricePaise}
                inStock={product.inStock}
                variants={product.variants}
              />
            </Suspense>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-line pt-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-brand" aria-hidden /> Free delivery above ₹499
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-brand" aria-hidden /> Secure payments
            </span>
          </div>

          {product.description && (
            <div className="border-t border-line pt-4">
              <h2 className="font-medium text-ink">Details</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{product.description}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
