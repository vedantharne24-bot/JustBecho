"use client";

import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { Expand } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";

/**
 * Desktop: a column of full-height photographs with a sticky thumbnail rail
 * that tracks the image in view; each photograph settles from a slight scale
 * as it scrolls in. Mobile: a snapping carousel with a counter.
 */
export function ProductGallery({
  images,
  productId,
  title,
  sold,
}: {
  images: ProductImage[];
  productId: string;
  title: string;
  sold?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Track which photograph is in view (desktop column)
  useEffect(() => {
    const items = root.current?.querySelectorAll<HTMLElement>("[data-gallery-item]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.galleryItem));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [images.length]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-gallery-item]").forEach((item, i) => {
          if (i === 0) return;
          const img = item.querySelector("img");
          gsap.fromTo(
            img,
            { scale: 1.08 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "top 30%", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const onCarouselScroll = () => {
    const el = carousel.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div ref={root} className="relative">
      {/* Desktop */}
      <div className="hidden gap-4 lg:flex">
        <nav aria-label="Product images" className="sticky top-[calc(var(--sticky-top)+1.5rem)] flex h-fit w-14 shrink-0 flex-col gap-2 transition-[top] duration-500">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === active}
              onClick={() => {
                const target = root.current?.querySelector<HTMLElement>(`[data-gallery-item="${i}"]`);
                if (target) scrollToTarget(target, { offset: -96 });
              }}
              className={cn(
                "relative aspect-[4/5] w-full overflow-hidden bg-media transition-opacity duration-300",
                i === active ? "opacity-100 outline outline-1 outline-offset-2 outline-fg" : "opacity-45 hover:opacity-80",
              )}
            >
              <Image src={img.src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {images.map((img, i) => {
            const media = (
              <span className="relative block aspect-[4/5] overflow-hidden bg-media">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  preload={i === 0}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className={cn("object-cover will-change-transform", sold && "grayscale-[0.5]")}
                />
              </span>
            );
            return (
              <button
                key={img.src + i}
                type="button"
                data-gallery-item={i}
                data-cursor="Zoom"
                onClick={() => setLightbox(i)}
                aria-label={`Open image ${i + 1} of ${images.length} in viewer`}
                className="group relative block cursor-zoom-in text-left"
              >
                {i === 0 ? (
                  <ViewTransition name={`media-${productId}`} share="media-morph" default="none">
                    {media}
                  </ViewTransition>
                ) : (
                  media
                )}
                <span className="pointer-events-none absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-paper/80 text-ink opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                  <Expand className="h-4 w-4" strokeWidth={1.25} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile & tablet */}
      <div className="relative lg:hidden">
        <div
          ref={carousel}
          onScroll={onCarouselScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-roledescription="carousel"
          aria-label="Product images"
        >
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setLightbox(i)}
              aria-label={`Open image ${i + 1} of ${images.length}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-media sm:aspect-[5/4]"
            >
              <Image src={img.src} alt={img.alt} fill preload={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {images.length > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5">
            {images.map((img, i) => (
              <span
                key={img.src + i}
                className={cn("h-[3px] rounded-full bg-paper transition-all duration-300", i === active ? "w-6 opacity-100" : "w-[3px] opacity-60")}
              />
            ))}
          </div>
        ) : null}
        <p className="mono tabular absolute right-4 top-4 bg-paper/85 px-2 py-1 text-[10px] text-ink">
          {active + 1} / {images.length}
        </p>
      </div>

      <Lightbox
        images={images}
        index={lightbox ?? 0}
        open={lightbox !== null}
        onOpenChange={(o) => !o && setLightbox(null)}
        onIndexChange={setLightbox}
        title={title}
      />
    </div>
  );
}
