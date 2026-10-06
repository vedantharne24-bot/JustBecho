import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs, Eyebrow } from "@/components/ui/misc";
import { getBrands } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Brands A–Z",
  description: "Every house authenticated on JustBecho, from Audemars Piguet to Yeezy.",
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const groups = brands.reduce<Record<string, typeof brands>>((acc, b) => {
    const letter = b.name[0].toUpperCase();
    (acc[letter] ??= []).push(b);
    return acc;
  }, {});
  const letters = Object.keys(groups).sort();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <PageShell>
      <header className="container-x pb-12 pt-8 sm:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
        <Eyebrow className="mt-10">The directory</Eyebrow>
        <h1 className="display-lg mt-5" data-reveal>
          {brands.length} houses, <em>one standard.</em>
        </h1>
        <p className="lede mt-6 max-w-xl text-muted" data-reveal>
          Each house has a dedicated specialist at the Becho Hub and a reference library of verified pieces to authenticate
          against.
        </p>
      </header>

      <nav
        aria-label="Jump to letter"
        className="sticky top-[var(--sticky-top)] z-20 border-y border-line bg-bg/95 backdrop-blur-xl transition-[top] duration-500"
      >
        <ul className="container-x no-scrollbar flex gap-1 overflow-x-auto py-3">
          {alphabet.map((l) => (
            <li key={l}>
              {groups[l] ? (
                <a href={`#letter-${l}`} className="mono grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-hover">
                  {l}
                </a>
              ) : (
                <span className="mono grid h-8 w-8 place-items-center text-subtle/50" aria-hidden>
                  {l}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x pb-28 pt-6">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="grid grid-cols-1 scroll-mt-40 gap-6 border-b border-line py-10 md:grid-cols-12">
            <h2 className="font-display text-6xl leading-none md:col-span-2">{letter}</h2>
            <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 md:col-span-10 lg:grid-cols-3">
              {groups[letter].map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-line py-4">
                    <span>
                      <span className="font-display block text-2xl transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                        {b.name}
                      </span>
                      <span className="mono mt-1 block text-subtle">
                        {b.origin} · {b.founded}
                      </span>
                    </span>
                    <span className="mono shrink-0 text-muted">{b.count ? `${b.count} live` : "Sold out"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
