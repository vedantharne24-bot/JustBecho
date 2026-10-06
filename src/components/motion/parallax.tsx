"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked drift for editorial imagery. The frame stays put while its
 * contents travel `amount`% — a transform-only, scrubbed tween.
 */
export function Parallax({
  children,
  amount = 12,
  scale = 1.18,
  className,
  innerClassName,
}: {
  children: ReactNode;
  amount?: number;
  scale?: number;
  className?: string;
  innerClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-parallax-inner]",
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative overflow-hidden", className)}>
      <div data-parallax-inner className={cn("absolute inset-0 will-change-transform", innerClassName)} style={{ scale }}>
        {children}
      </div>
    </div>
  );
}
