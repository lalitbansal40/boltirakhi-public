import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';
import { formatPaise, percentOff } from '@/lib/money';
import type { Product } from '@/lib/types';

/**
 * The shape every product grid uses — home, category pages, search.
 *
 * Settled now, against placeholder data, so Phase 2 fills this same component
 * from the API instead of writing a second card that then has to be kept in
 * step with this one.
 */
type CardProduct = Pick<
  Product,
  '_id' | 'title' | 'slug' | 'pricePaise' | 'mrpPaise' | 'images' | 'inStock' | 'type'
>;

export function ProductCard({ product }: { product: CardProduct }) {
  const discount = percentOff(product.pricePaise, product.mrpPaise);
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-accent-soft/40">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.title}
            fill
            // Without sizes the browser downloads the desktop image on a phone.
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff className="size-8 text-muted/50" aria-hidden />
          </div>
        )}

        {discount !== null && discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-fg">
            {discount}% off
          </span>
        )}

        {product.type === 'bolti' && (
          <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-ink">
            Bolti
          </span>
        )}
      </div>

      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-brand">{formatPaise(product.pricePaise)}</span>
          {product.mrpPaise > product.pricePaise && (
            <span className="text-xs text-muted line-through">
              {formatPaise(product.mrpPaise)}
            </span>
          )}
        </div>
        {!product.inStock && <p className="text-xs text-muted">Out of stock</p>}
      </div>
    </Link>
  );
}

/** Matches the card's dimensions, so nothing shifts when the data lands. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
