"use client";

import { useEffect, useRef } from "react";

/** A hairline that fills as the article is read. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-[2px]">
      <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
