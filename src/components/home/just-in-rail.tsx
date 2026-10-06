"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow } from "@/components/ui/misc";

/**
 * "Just in" — on desktop the section pins and vertical scroll drives the
 * track sideways; on touch devices it is a native, snapping carousel whose
 * cards are dealt in from the right as the section arrives.
 */
export function JustInRail({ products, total }: { products: Product[]; total: number }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const swipeBar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      });
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-rail-card]",
          { xPercent: (i: number) => 40 + i * 18, rotate: (i: number) => 4 + i * 1.5, opacity: 0.35 },
          {
            xPercent: 0,
            rotate: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top 90%", end: "top 20%", scrub: 0.5 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  // Swipe progress for the native carousel
  const onTrackScroll = () => {
    const el = track.current;
    if (!el || !swipeBar.current) return;
    const max = el.scrollWidth - el.clientWidth;
    swipeBar.current.style.transform = `scaleX(${max > 0 ? Math.max(0.06, el.scrollLeft / max) : 1})`;
  };

  return (
    <section ref={section} aria-labelledby="just-in-title" className="relative overflow-hidden py-20 sm:py-28 lg:flex lg:h-[100svh] lg:items-center lg:py-0">
      <div
        ref={track}
        onScroll={onTrackScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] sm:gap-6 lg:snap-none lg:gap-[2.2vw] lg:overflow-visible lg:will-change-transform"
      >
        <div className="flex w-[78vw] shrink-0 snap-start flex-col justify-between sm:w-[44vw] lg:w-[30vw] lg:pr-[3vw]">
          <div>
            <Eyebrow index="03">Just in</Eyebrow>
            <h2 id="just-in-title" className="display-lg mt-6">
              New this
              <br />
              <em>week.</em>
            </h2>
            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              {total} pieces cleared authentication in the last seven days. Most will not be here next week.
            </p>
          </div>
          <Link href="/explore?sort=newest" className="label group mt-10 inline-flex items-center gap-3">
            <span className="link-draw">Shop all new arrivals</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
          </Link>
        </div>

        {products.map((product, i) => (
          <div key={product.id} data-rail-card className="w-[64vw] shrink-0 snap-start sm:w-[36vw] lg:w-[21vw]">
            <p className="mono mb-3 text-subtle">{String(i + 1).padStart(2, "0")}</p>
            <ProductCard product={product} sizes="(min-width: 1024px) 21vw, (min-width: 640px) 36vw, 64vw" />
          </div>
        ))}

        <Link
          href="/explore?sort=newest"
          className="group flex w-[64vw] shrink-0 snap-start flex-col justify-end border-l border-line pl-6 sm:w-[36vw] lg:w-[21vw] lg:pl-[2vw]"
        >
          <p className="mono text-subtle">+{Math.max(0, total - products.length)} more</p>
          <p className="font-display mt-3 text-4xl leading-none transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">
            See everything
            <br />
            <em>that’s new</em>
          </p>
          <ArrowRight className="mt-6 h-6 w-6 transition-transform duration-500 group-hover:translate-x-2" strokeWidth={1} />
        </Link>
        <div aria-hidden className="w-px shrink-0 lg:w-[2vw]" />
      </div>

      <div aria-hidden className="absolute inset-x-[var(--gutter)] bottom-10 hidden h-px bg-line lg:block">
        <div ref={bar} className="h-full origin-left bg-fg" style={{ transform: "scaleX(0)" }} />
      </div>
      <div aria-hidden className="mx-[var(--gutter)] mt-8 h-px bg-line lg:hidden">
        <div ref={swipeBar} className="h-full origin-left bg-fg transition-transform duration-150" style={{ transform: "scaleX(0.06)" }} />
      </div>
    </section>
  );
}
