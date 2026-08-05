import { BadgeCheck, QrCode, ScanLine, ShieldCheck, Truck, Video } from 'lucide-react';
import Link from 'next/link';

import { FestiveRain } from '@/components/home/festive-rain';
import { ProductCard } from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import type { Category, Product } from '@/lib/types';

type CardProduct = Pick<
  Product,
  '_id' | 'title' | 'slug' | 'pricePaise' | 'mrpPaise' | 'images' | 'inStock' | 'type'
>;

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-ink">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-sm text-brand underline-offset-4 hover:underline"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function Hero({ featuredCategory }: { featuredCategory?: Category }) {
  return (
    <section className="relative overflow-hidden bg-accent-soft/40">
      <FestiveRain />
      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 py-16 text-center sm:py-24">
        {/* Exactly one h1 on the page. */}
        <h1 className="font-heading text-3xl font-bold text-brand sm:text-5xl">
          A rakhi that carries your voice
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted sm:text-lg">
          Record a message for your brother. We print a QR code on the packaging.
          He scans it when he opens the box, and hears you.
        </p>
        {/*
          Both of these used to point at category slugs that do not exist —
          /rakhi/bhaiya-bhabhi-rakhi and /rakhi/rakhi-combo — so the biggest
          button on the site led to a 404.

          /rakhi needs no slug and cannot rot. The second button takes a real
          category, passed in from the page, which reads it from the API.
        */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" render={<Link href="/rakhi" />}>
            Shop all rakhis
          </Button>
          {featuredCategory && (
            <Button
              size="lg"
              variant="outline"
              render={<Link href={`/rakhi/${featuredCategory.slug}`} />}
            >
              {featuredCategory.name}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <Section title="Shop by category">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/rakhi/${category.slug}`}
            className="rounded-[var(--radius-card)] border border-line bg-surface p-6 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-heading text-lg font-semibold text-ink">{category.name}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function ProductSection({
  title,
  href,
  linkLabel = 'View all',
  products,
}: {
  /** Overrides "View all" — the home page counts the catalogue instead. */
  linkLabel?: string;
  title: string;
  href: string;
  products: CardProduct[];
}) {
  return (
    <Section title={title} action={{ label: linkLabel, href }}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
}

const STEPS = [
  { icon: Video, title: 'Record your message', body: 'A short video, a letter, or a few photos. All of it is optional.' },
  { icon: QrCode, title: 'We print the QR', body: 'It goes on the rakhi packaging before we ship it.' },
  { icon: ScanLine, title: 'He scans and watches', body: 'No app, no account. The camera is enough.' },
];

export function HowItWorks() {
  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="text-center font-heading text-2xl font-bold text-ink">
          How Bolti Rakhi works
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft">
                <step.icon className="size-5 text-brand" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-ink">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: Truck, label: 'Free delivery above ₹499' },
  { icon: ShieldCheck, label: 'Secure payments' },
  { icon: BadgeCheck, label: 'Delivered across India' },
];

export function TrustBar() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:grid-cols-3">
        {TRUST.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2 text-sm text-muted">
            <item.icon className="size-4 text-brand" aria-hidden />
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}
