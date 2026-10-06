"use client";

import Link from "next/link";
import { useRef } from "react";
import { brands } from "@/lib/data/brands";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

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

/**
 * The houses we authenticate, drifting past. Scrolling pushes the line — it
 * speeds up and leans with a flick, and runs backwards when you scroll up.
 */
export function BrandMarquee() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const loop = useRef<gsap.core.Tween | null>(null);
  const list = ORDER.map((slug) => brands.find((b) => b.slug === slug)!).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const tween = gsap.to(el, { xPercent: -50, ease: "none", duration: 70, repeat: -1 });
        // Start deep into the loop so it can also run in reverse
        tween.totalTime(tween.duration() * 1000);
        loop.current = tween;
        let direction = 1;
        const lean = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3.out" });
        const settle = gsap.delayedCall(0.18, () => lean(0)).pause();

        const st = ScrollTrigger.create({
          trigger: section.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            direction = self.direction;
            const boost = gsap.utils.clamp(1, 9, 1 + Math.abs(velocity) / 250);
            gsap.to(tween, { timeScale: boost * direction, duration: 0.15, overwrite: true });
            gsap.to(tween, { timeScale: direction, duration: 1.4, delay: 0.15, ease: "power2.out" });
            lean(gsap.utils.clamp(-9, 9, -velocity / 220));
            settle.restart(true);
          },
        });
        return () => {
          st.kill();
          settle.kill();
          tween.kill();
          loop.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const hold = (on: boolean) => {
    const tween = loop.current;
    if (!tween) return;
    gsap.to(tween, { timeScale: on ? 0 : Math.sign(tween.timeScale()) || 1, duration: 0.6, overwrite: true });
  };

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
    <section ref={section} aria-label="Houses we authenticate" className="overflow-hidden border-y border-line py-10 sm:py-14">
      <div
        ref={track}
        className="flex w-max will-change-transform"
        onPointerEnter={(e) => e.pointerType === "mouse" && hold(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && hold(false)}
      >
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
