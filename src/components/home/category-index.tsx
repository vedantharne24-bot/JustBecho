"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/misc";

interface CategoryItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  count: number;
  image: { src: string; alt: string };
}

/**
 * An editorial index: category names set large, the photograph for whichever
 * line is hovered (or focused) is revealed in a sticky frame alongside.
 */
export function CategoryIndex({ categories }: { categories: CategoryItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="categories-title" className="container-x py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Eyebrow index="02">The departments</Eyebrow>
          <h2 id="categories-title" className="sr-only">
            Shop by category
          </h2>

          {/* Desktop index */}
          <ul className="mt-10 hidden border-t border-line lg:block">
            {categories.map((c, i) => (
              <li key={c.slug} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}>
                <Link
                  href={`/categories/${c.slug}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline border-b border-line py-6"
                >
                  <span className="mono text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex items-baseline gap-5">
                    <span
                      className={cn(
                        "font-display text-[clamp(2.75rem,4.6vw,4.75rem)] leading-[0.95] tracking-tight transition-[color,transform] duration-700 ease-out",
                        active === i ? "translate-x-3 text-fg" : "text-fg/35",
                      )}
                    >
                      {c.name}
                    </span>
                    <span
                      className={cn(
                        "mono text-muted transition-opacity duration-500",
                        active === i ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {c.tagline}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="mono tabular text-muted">{c.count} pieces</span>
                    <ArrowUpRight
                      aria-hidden
                      strokeWidth={1}
                      className={cn(
                        "h-6 w-6 transition-[transform,opacity] duration-500 ease-out",
                        active === i ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                      )}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile & tablet: image cards */}
          <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:hidden">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-media">
                    <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 640px) 30vw, 46vw" className="object-cover transition-transform duration-700 group-active:scale-105" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-2xl">{c.name}</span>
                    <span className="mono text-subtle">{c.count}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)]">
            <Link
              href={`/categories/${categories[active].slug}`}
              tabIndex={-1}
              data-cursor="Explore"
              className="relative block aspect-[4/5] overflow-hidden bg-media"
            >
              {categories.map((c, i) => (
                <div
                  key={c.slug}
                  className={cn(
                    "absolute inset-0 transition-[clip-path] duration-[1100ms] ease-in-out",
                    i === active ? "z-10 [clip-path:inset(0_0_0_0)]" : "z-0 [clip-path:inset(0_0_100%_0)]",
                  )}
                >
                  <Image
                    src={c.image.src}
                    alt={i === active ? c.image.alt : ""}
                    fill
                    sizes="40vw"
                    className={cn(
                      "object-cover transition-transform duration-[1800ms] ease-out",
                      i === active ? "scale-100" : "scale-110",
                    )}
                  />
                </div>
              ))}
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between bg-gradient-to-t from-ink/55 to-transparent p-6 pt-24 text-ivory">
                <p className="max-w-[18rem] text-sm leading-relaxed text-ivory/85">{categories[active].description}</p>
                <span className="mono">{String(active + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
