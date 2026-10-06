"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { ButtonLink } from "@/components/ui/button";
import { Seal } from "@/components/ui/seal";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
  brand: string;
  name: string;
  certificate: string;
  href: string;
}

const INTERVAL = 5200;

/**
 * Cinematic hero. A portrait frame sits between the two words of the
 * headline; on desktop the section pins and the frame opens to full-bleed
 * while the words part, handing over to a statement about provenance.
 */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
          if (!motion) {
            root.current?.setAttribute("data-intro", "done");
            return;
          }

          // Intro: words rise out of their masks, the photograph rises into its frame
          const split = SplitText.create("[data-hero-word]", { type: "chars", mask: "chars" });
          // Wait for the first-visit curtain to lift before the words rise
          const curtain = document.documentElement.dataset.intro === "playing" ? 1.05 : 0;
          const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: curtain });
          intro
            .from(split.chars, { yPercent: 110, duration: 1.4, stagger: 0.035 }, 0.15)
            .from("[data-hero-media]", { yPercent: 102, duration: 1.6 }, 0.05)
            .from("[data-hero-zoom]", { scale: 1.3, duration: 2.2 }, 0.05)
            .from("[data-hero-fade]", { opacity: 0, y: 18, duration: 1.1, stagger: 0.08 }, 0.7)
            .from("[data-hero-seal]", { opacity: 0, scale: 0.6, rotate: -90, duration: 1.6 }, 0.9);
          // Start states are applied; reveal the (now masked) elements
          root.current?.setAttribute("data-intro", "done");

          if (desktop) {
            // Scroll: the frame opens to full-bleed while the headline parts
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "+=130%",
                pin: true,
                scrub: 0.6,
                onUpdate: (self) => setPaused(self.progress > 0.02 && self.progress < 0.98 ? true : false),
              },
            });
            tl.to(root.current, { "--p": 1, duration: 1, ease: "power2.inOut" }, 0)
              .to("[data-hero-line='1']", { xPercent: -28, yPercent: -40, opacity: 0, duration: 0.55 }, 0)
              .to("[data-hero-line='2']", { xPercent: 28, yPercent: 40, opacity: 0, duration: 0.55 }, 0)
              .to("[data-hero-footer]", { opacity: 0, y: 24, duration: 0.3 }, 0)
              .to("[data-hero-seal-spin]", { rotate: 180, scale: 0.7, opacity: 0, duration: 0.5 }, 0)
              .to("[data-hero-scrim]", { opacity: 1, duration: 0.5 }, 0.45)
              .fromTo(
                "[data-hero-statement] > *",
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power3.out" },
                0.62,
              );
          } else {
            // Tablet & mobile: gentle parallax as the hero leaves
            gsap.to("[data-hero-zoom]", {
              yPercent: 12,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
            });
          }

          return () => {
            split.revert();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <section
      ref={root}
      aria-label="JustBecho — authenticated pre-owned luxury"
      data-intro="pending"
      className="hero theme-dark grain relative isolate overflow-hidden lg:h-[100svh] lg:min-h-[680px]"
      style={{ ["--p" as string]: 0 }}
    >
      {/* Headline */}
      <h1 className="sr-only">Luxury, proven. Authenticated pre-owned luxury in India.</h1>
      <div
        aria-hidden
        data-hero-intro
        className="pointer-events-none relative z-20 pt-[calc(var(--header-h)+2.5rem)] lg:absolute lg:inset-0 lg:pt-0 lg:mix-blend-difference"
      >
        <div className="container-x lg:h-full">
          <p data-hero-line="1" className="display-xl text-ivory lg:absolute lg:left-[var(--gutter)] lg:top-[15svh]">
            <span data-hero-word className="block">
              Luxury,
            </span>
          </p>
          <p
            data-hero-line="2"
            className="display-xl text-right text-ivory lg:absolute lg:bottom-[15svh] lg:right-[var(--gutter)]"
          >
            <span data-hero-word className="block italic">
              proven.
            </span>
          </p>
        </div>
      </div>

      {/* Photograph — a framed window that opens to full-bleed on scroll */}
      <div className="container-x relative z-10 mt-8 lg:static lg:mt-0 lg:p-0">
        <div className="hero-stage relative aspect-square overflow-hidden sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto">
          <Link
            href={slide.href}
            className="absolute inset-0 block"
            data-cursor="View piece"
            aria-label={`View ${slide.brand} ${slide.name}`}
          >
            <div data-hero-media className="absolute inset-0 overflow-hidden">
              <div data-hero-zoom className="absolute inset-0">
              {slides.map((s, i) => (
                <div
                  key={s.src}
                  className={cn(
                    "hero-slide absolute inset-0",
                    i === index ? "is-active" : i === (index - 1 + slides.length) % slides.length ? "is-prev" : "",
                  )}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    preload={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              ))}
              </div>
            </div>
            <div data-hero-scrim className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/50 to-ink/75 opacity-0" />
          </Link>

          {/* Statement revealed once the frame is full-bleed (desktop) */}
          <div
            data-hero-statement
            className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center px-8 text-center lg:flex"
          >
            <p className="display-lg max-w-5xl text-ivory opacity-0">Every piece has a past.</p>
            <p className="display-lg mt-2 italic text-ivory opacity-0">We prove it.</p>
            <p className="mono mt-10 text-ivory/70 opacity-0">Becho Protect — inspected by hand in Mumbai</p>
          </div>
        </div>

        <div data-hero-seal data-hero-intro className="absolute -top-8 right-[calc(var(--gutter)+0.75rem)] z-30 lg:right-[calc(50vw-23.25svh-3.5rem)] lg:top-[calc(19svh-3.5rem)]">
          <div data-hero-seal-spin>
            <Seal className="w-20 text-ivory lg:w-28" />
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div data-hero-footer data-hero-intro className="container-x relative z-30 pb-12 pt-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:pb-[4svh] lg:pt-0">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[24rem] lg:max-w-[17rem] xl:max-w-[22rem]">
            <p data-hero-fade className="text-[0.9375rem] leading-relaxed text-ivory/80">
              India’s house for authenticated pre-owned luxury. Every piece is inspected by hand and sealed with
              Becho Protect before it reaches you.
            </p>
            <div data-hero-fade className="mt-6 flex flex-wrap items-center gap-5">
              <ButtonLink href="/explore" variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
                Explore the edit
              </ButtonLink>
              <Link href="/sell" className="label link-undraw text-ivory">
                Sell a piece
              </Link>
            </div>
          </div>

          <div data-hero-fade className="flex items-end gap-6 lg:max-w-[20rem] lg:flex-col lg:items-end lg:text-right">
            <div className="min-w-0 flex-1 lg:flex-none">
              <p className="mono text-ivory/50">
                N° {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")} · {slide.certificate}
              </p>
              <p className="mt-2 truncate text-sm text-ivory">
                {slide.brand} <span className="text-ivory/60">{slide.name}</span>
              </p>
            </div>
            <div className="flex gap-1.5" role="tablist" aria-label="Featured pieces">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${s.brand} ${s.name}`}
                  onClick={() => setIndex(i)}
                  className="group relative h-6 w-8"
                >
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ivory/25" />
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-px -translate-y-1/2 bg-ivory",
                      i === index && !paused ? "hero-progress" : i === index ? "w-full" : "w-0",
                    )}
                    style={{ ["--hero-interval" as string]: `${INTERVAL}ms` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
