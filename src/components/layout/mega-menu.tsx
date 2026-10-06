"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { m } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { DISCOVER_LINKS } from "@/lib/nav";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface MegaMenuData {
  categories: { slug: string; name: string; tagline: string; count: number; image: { src: string; alt: string } }[];
  brands: { slug: string; name: string; count: number }[];
  allBrandsCount: number;
}

export function MegaMenu({
  data,
  active,
  onNavigate,
  onPointerEnter,
}: {
  data: MegaMenuData;
  active: "explore" | "brands";
  onNavigate: () => void;
  onPointerEnter: () => void;
}) {
  const [preview, setPreview] = useState(0);
  const category = data.categories[preview];

  return (
    <m.div
      data-mega-menu
      onPointerEnter={onPointerEnter}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: 0.6, ease: ease.out } }}
      exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.35, ease: ease.inOut } }}
      className="absolute inset-x-0 top-full hidden border-b border-line bg-bg text-fg lg:block"
    >
      <m.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out, delay: 0.08 } }}
        className="container-x grid grid-cols-12 gap-10 py-12"
      >
        {active === "explore" ? (
          <>
            <div className="col-span-5">
              <p className="mono mb-6 text-muted">Categories</p>
              <ul className="flex flex-col">
                {data.categories.map((c, i) => (
                  <li key={c.slug} onPointerEnter={() => setPreview(i)}>
                    <Link
                      href={`/categories/${c.slug}`}
                      onClick={onNavigate}
                      onFocus={() => setPreview(i)}
                      className="group flex items-baseline justify-between border-b border-line py-3"
                    >
                      <span
                        className={cn(
                          "font-display text-[1.75rem] leading-none transition-[color,transform] duration-500 ease-out group-hover:translate-x-2",
                          preview === i ? "text-fg" : "text-muted",
                        )}
                      >
                        {c.name}
                      </span>
                      <span className="mono text-subtle">{String(c.count).padStart(2, "0")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-3">
              <p className="mono mb-6 text-muted">Discover</p>
              <ul className="flex flex-col gap-3.5">
                {DISCOVER_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={onNavigate} className="link-draw text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mono mb-5 mt-10 text-muted">Shop by</p>
              <ul className="flex gap-6 text-sm">
                <li>
                  <Link href="/women" onClick={onNavigate} className="link-draw">
                    Women
                  </Link>
                </li>
                <li>
                  <Link href="/men" onClick={onNavigate} className="link-draw">
                    Men
                  </Link>
                </li>
              </ul>
            </div>
            <Link
              href={`/categories/${category.slug}`}
              onClick={onNavigate}
              className="group relative col-span-4 block aspect-[4/3] overflow-hidden bg-media"
              tabIndex={-1}
            >
              {data.categories.map((c, i) => (
                <Image
                  key={c.slug}
                  src={c.image.src}
                  alt={i === preview ? c.image.alt : ""}
                  fill
                  sizes="33vw"
                  className={cn(
                    "object-cover transition-[opacity,transform] duration-700 ease-out",
                    i === preview ? "scale-100 opacity-100" : "scale-105 opacity-0",
                  )}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-ivory">
                <div>
                  <p className="mono text-ivory/70">{category.tagline}</p>
                  <p className="font-display mt-1 text-3xl">{category.name}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.25} />
              </div>
            </Link>
          </>
        ) : (
          <>
            <div className="col-span-8">
              <p className="mono mb-6 text-muted">Houses we authenticate</p>
              <ul className="grid grid-cols-3 gap-x-10">
                {data.brands.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/brands/${b.slug}`}
                      onClick={onNavigate}
                      className="group flex items-baseline justify-between border-b border-line py-3"
                    >
                      <span className="font-display text-[1.375rem] leading-none transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                        {b.name}
                      </span>
                      <span className="mono text-subtle">{b.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-4 flex flex-col justify-between border-l border-line pl-10">
              <div>
                <p className="mono text-muted">The directory</p>
                <p className="font-display mt-4 text-4xl leading-[1.05]">
                  {data.allBrandsCount} houses,
                  <br />
                  <em>one standard.</em>
                </p>
                <p className="mt-4 max-w-xs text-sm text-muted">
                  Every brand on JustBecho has a dedicated specialist and a reference library of authentic pieces.
                </p>
              </div>
              <Link href="/brands" onClick={onNavigate} className="label group mt-8 inline-flex items-center gap-2">
                <span className="link-draw">All brands A–Z</span>
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.25} />
              </Link>
            </div>
          </>
        )}
      </m.div>
    </m.div>
  );
}
