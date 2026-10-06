import Link from "next/link";
import { brands } from "@/lib/data/brands";

const ORDER = [
  "hermes",
  "rolex",
  "chanel",
  "patek-philippe",
  "louis-vuitton",
  "cartier",
  "jordan",
  "dior",
  "audemars-piguet",
  "gucci",
  "off-white",
  "prada",
  "omega",
  "saint-laurent",
  "supreme",
  "bottega-veneta",
];

export function BrandMarquee() {
  const list = ORDER.map((slug) => brands.find((b) => b.slug === slug)!).filter(Boolean);
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {list.map((b) => (
        <li key={b.slug} className="flex items-center">
          <Link
            href={`/brands/${b.slug}`}
            tabIndex={hidden ? -1 : undefined}
            className="font-display whitespace-nowrap px-6 text-[2.5rem] italic leading-none text-fg/80 transition-colors duration-300 hover:text-fg sm:px-10 sm:text-[4.25rem]"
          >
            {b.name}
          </Link>
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-accent" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Houses we authenticate" className="overflow-hidden border-y border-line py-10 sm:py-14">
      <div className="group flex w-max [animation:marquee_70s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
