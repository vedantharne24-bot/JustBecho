"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/lenis";
import { useUI } from "@/store/ui";

/**
 * Lenis drives wheel scrolling on desktop and feeds GSAP's ticker so scroll-
 * linked animation and smooth scroll share a single frame loop. Touch devices
 * keep native momentum scrolling. Disabled entirely for reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const overlay = useUI((s) => s.overlay);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.105,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      anchors: true,
      prevent: (node) => node instanceof Element && !!node.closest("[data-lenis-prevent]"),
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Freeze the page beneath full-screen layers
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (overlay) lenis.stop();
    else lenis.start();
  }, [overlay]);

  // Re-measure after navigation so pinned sections and triggers line up
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      getLenis()?.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
