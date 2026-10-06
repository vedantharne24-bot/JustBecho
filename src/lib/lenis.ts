"use client";

import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Scroll that respects the smooth-scroll engine when present */
export function scrollToTarget(target: number | string | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.2 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: opts.immediate ? "auto" : "smooth" });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
      window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
    }
  }
}
