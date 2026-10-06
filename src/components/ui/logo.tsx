import { cn } from "@/lib/utils";
import { MONOGRAM, WORDMARK_DISPLAY, WORDMARK_TEXT } from "./logo-paths";

/**
 * The JustBecho wordmark — Didone capitals, tracked wide, with the seal
 * diamond between the words. Drawn as outlines so it renders identically
 * everywhere. `variant="display"` uses the high-contrast cut for large sizes;
 * the default cut has sturdier hairlines for the header.
 */
export function Logo({
  className,
  variant = "text",
  title = "JustBecho",
}: {
  className?: string;
  variant?: "text" | "display";
  title?: string;
}) {
  const mark = variant === "display" ? WORDMARK_DISPLAY : WORDMARK_TEXT;
  const { cx, cy, r } = mark.dot;
  return (
    <svg viewBox={mark.viewBox} role="img" aria-label={title} className={cn("h-[0.72em] w-auto overflow-visible", className)}>
      <path d={mark.d} fill="currentColor" />
      <rect
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        transform={`rotate(45 ${cx} ${cy})`}
        className="fill-[var(--c-seal-bright)]"
      />
    </svg>
  );
}

/** Interlaced J/B monogram inside a double sealing ring. */
export function Monogram({ className, ring = true }: { className?: string; ring?: boolean }) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden className={cn("h-8 w-8", className)}>
      {ring ? (
        <>
          <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="150" cy="150" r="127" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </>
      ) : null}
      <g transform={`translate(${MONOGRAM.bT[0]} ${MONOGRAM.bT[1]})`}>
        <path d={MONOGRAM.b} fill="currentColor" />
      </g>
      <g transform={`translate(${MONOGRAM.jT[0]} ${MONOGRAM.jT[1]})`}>
        {/* A knock-out stroke separates the J from the B where they cross */}
        <path d={MONOGRAM.j} fill="currentColor" stroke="var(--bg)" strokeWidth="11" paintOrder="stroke" />
      </g>
    </svg>
  );
}
