"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/hooks/use-media-query";

/**
 * A contextual label that follows the pointer only over elements that opt in
 * with `data-cursor="View"`. The native cursor is never hidden.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!fine || reduced) return;
    const el = ref.current;
    if (!el) return;

    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let active = false;

    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (active || Math.abs(x - cx) > 0.3 || Math.abs(y - cy) > 0.3) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX + 14;
      y = e.clientY + 14;
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      const next = target?.dataset.cursor ?? null;
      active = !!next;
      setLabel((prev) => (prev === next ? prev : next));
      if (active && !raf) {
        if (cx < 0) {
          cx = x;
          cy = y;
        }
        raf = requestAnimationFrame(loop);
      }
    };

    const onLeave = () => {
      active = false;
      setLabel(null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] will-change-transform"
    >
      <div
        className="mono flex h-7 items-center rounded-full bg-ink/90 px-3 text-[10px] text-ivory backdrop-blur-sm transition-[opacity,scale] duration-300"
        style={{
          opacity: label ? 1 : 0,
          scale: label ? "1" : "0.6",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        {label ?? ""}
      </div>
    </div>
  );
}
