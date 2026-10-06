"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Headline reveal: text is split into masked lines that rise into place when
 * the heading enters the viewport. Lines re-split on resize (autoSplit).
 */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className,
  delay = 0,
  stagger = 0.09,
  id,
}: {
  id?: string;
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current;
        if (!el) return;
        let tween: gsap.core.Tween | undefined;
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            tween?.kill();
            tween = gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.3,
              ease: "expo.out",
              stagger,
              delay,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
            return tween;
          },
        });
        gsap.set(el, { visibility: "visible" });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={cn("split-reveal", className)}>
      {children}
    </Tag>
  );
}
