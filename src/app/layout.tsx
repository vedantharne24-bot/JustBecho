import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, DM_Mono, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { IntroCurtain } from "@/components/layout/intro-curtain";
import { getBrands, getCategories, getMostWanted } from "@/lib/api/catalog";
import { getBrandName } from "@/lib/data/brands";
import { FEATURED_BRANDS } from "@/lib/nav";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JustBecho — Authenticated pre-owned luxury",
    template: "%s · JustBecho",
  },
  description:
    "India's house for authenticated pre-owned luxury. Hermès, Rolex, Chanel, Jordan and more — every piece inspected by hand and sealed with Becho Protect.",
  applicationName: "JustBecho",
  openGraph: {
    type: "website",
    siteName: "JustBecho",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b0a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, brands, wanted] = await Promise.all([getCategories(), getBrands(), getMostWanted(4)]);

  const menu = {
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      count: c.count,
      image: { src: c.image.src, alt: c.image.alt },
    })),
    brands: FEATURED_BRANDS.map((slug) => brands.find((b) => b.slug === slug)!).filter(Boolean),
    allBrandsCount: brands.length,
  };

  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Marks JS as available before first paint so scroll reveals never hide content without it */}
        <Script id="js-flag" strategy="beforeInteractive">
          {"(function(){var d=document.documentElement;d.classList.add('js');try{if(!sessionStorage.getItem('jb-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='playing';sessionStorage.setItem('jb-intro','1')}}catch(e){}})()"}
        </Script>
        <IntroCurtain />
        <Providers>
          <Header menu={menu} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <SearchOverlay
            categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: c.count, image: c.image.src }))}
            suggestions={wanted.map((p) => ({
              slug: p.slug,
              name: p.name,
              brand: getBrandName(p.brand),
              price: p.price,
              image: p.images[0].src,
            }))}
          />
          <MobileMenu categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
