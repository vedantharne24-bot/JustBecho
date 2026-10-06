import { ViewTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps each page so route changes cross-fade with a short lift
 * (see `::view-transition-*(.page)` in globals.css). Pages that start under
 * the transparent header pass `bleed`.
 */
export function PageShell({
  children,
  bleed = false,
  className,
}: {
  children: ReactNode;
  bleed?: boolean;
  className?: string;
}) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div className={cn(!bleed && "pt-[var(--header-h)]", className)}>{children}</div>
    </ViewTransition>
  );
}
