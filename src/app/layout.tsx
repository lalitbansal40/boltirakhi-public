import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

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
      className={`${heading.variable} ${body.variable} antialiased`}
    >
      {/* dvh, not vh — mobile browsers measure vh against a chrome that is not
          there, leaving a gap under the footer. */}
      <body className="flex min-h-dvh flex-col">
        <Header categories={categories} />
        {/* flex-1 is what keeps the footer at the bottom on short pages. */}
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
        <Toaster />
      </body>
    </html>
  );
}
