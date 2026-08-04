import { QrCode, ShieldCheck, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductGallery } from '@/components/catalog/product-gallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (product.pricePaise / 100).toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://boltirakhi.com/product/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        // The object is built here from our own data, so there is nothing
        // user-supplied to escape.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
            </div>
          )}

          {/* Honest about not being ready: a button that looks live and does
              nothing is worse than one that says so. Cart arrives in Phase 4. */}
          <div className="space-y-2">
            <Button size="lg" className="w-full sm:w-auto" disabled>
              {product.inStock ? 'Add to cart — coming soon' : 'Out of stock'}
            </Button>
            {product.inStock && (
              <p className="text-sm text-muted">Online ordering opens shortly.</p>
            )}
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
