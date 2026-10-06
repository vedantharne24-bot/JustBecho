"use client";

import { useEffect } from "react";
import { Logo, Monogram } from "@/components/ui/logo";

/**
 * First-visit moment: the monogram is stamped, the wordmark settles, and the
 * curtain lifts — about a second, once per session, and never for reduced
 * motion. Whether it plays is decided by an inline script before first paint
 * (see layout.tsx); the animation itself is pure CSS.
 */
export function IntroCurtain() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "playing") return;
    const t = setTimeout(() => {
      root.dataset.intro = "done";
    }, 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="intro-curtain" aria-hidden>
      <div className="intro-seal">
        <Monogram className="h-24 w-24 text-ivory sm:h-28 sm:w-28" />
      </div>
      <div className="intro-word text-ivory">
        <Logo variant="display" title="" className="h-auto w-[min(70vw,30rem)]" />
      </div>
    </div>
  );
}
