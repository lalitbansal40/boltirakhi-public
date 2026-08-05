import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";

import { AuthProvider } from "@/components/auth/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { getCategories } from "@/lib/catalog";
import "./globals.css";

/**
 * Two families, no more: each extra one costs a round trip on a phone, and
 * this site's traffic will arrive on phones over mobile data.
 *
 * `display: swap` so text paints in a fallback immediately rather than holding
 * the first paint hostage to a font download.
 */
const heading = Fraunces({
  variable: "--font-heading-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

/**
 * Devanagari, for the letter a sister writes in Hindi or Marathi.
 *
 * Inter and Fraunces are latin-only. Without this, Hindi falls back to
 * whatever the operating system has, which renders unevenly and reads as a
 * broken translation rather than a font problem — so nobody would report it.
 *
 * Loaded as a variable and applied only where the letter is written, not
 * across the site: every visitor would otherwise fetch a script they cannot
 * read.
 */
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500"],
});

const body = Inter({
  variable: "--font-body-family",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://boltirakhi.com"),
  title: {
    default: "Bolti Rakhi — rakhi that carries your voice",
    template: "%s | Bolti Rakhi",
  },
  description:
    "Send a rakhi with a video message your brother can scan and watch. Rakhi sets, combos and chocolates, delivered across India.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * Fetched here and passed down, because Header is a client component and a
   * client component cannot fetch on the server.
   *
   * The `?? []` matters more than it looks: this runs on every page, so an
   * unguarded failure here would take the whole site down rather than one
   * section of one page. An empty nav is survivable; a blank site is not.
   */
  const categories = (await getCategories().catch(() => null)) ?? [];
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${devanagari.variable} antialiased`}
    >
      {/* dvh, not vh — mobile browsers measure vh against a chrome that is not
          there, leaving a gap under the footer. */}
      <body className="flex min-h-dvh flex-col">
        {/* Both providers are client components wrapping server-rendered
            children. This layout stays a server component — marking it
            'use client' would take the whole site's SSR with it, and that
            SSR is the entire reason the catalogue is indexable. */}
        <AuthProvider>
          <CartProvider>
            <Header categories={categories} />
            {/* flex-1 is what keeps the footer at the bottom on short pages. */}
            <main className="flex-1">{children}</main>
            <Footer categories={categories} />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
