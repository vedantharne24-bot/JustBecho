import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Becho Protect seal: circular inscription around a monogram.
 * Rotation is opt-in and pauses for reduced-motion users via global CSS.
 */
export function Seal({
  className,
  text = "Becho Protect · Authenticated · Inspected by hand · ",
  spin = true,
  tone = "current",
}: {
  className?: string;
  text?: string;
  spin?: boolean;
  tone?: "current" | "accent";
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={cn("relative aspect-square w-28", tone === "accent" ? "text-accent" : "text-current", className)}>
      <svg viewBox="0 0 120 120" className={cn("absolute inset-0 h-full w-full", spin && "spin-slow")} aria-hidden>
        <defs>
          <path id={`seal-${id}`} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text fontFamily="var(--font-mono)" fontSize="8.4" fill="currentColor" style={{ textTransform: "uppercase" }}>
          <textPath href={`#seal-${id}`} textLength={287} lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <path
          d="M47 61.5l8.5 8.5L74 51.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Authenticated by Becho Protect</span>
    </div>
  );
}
