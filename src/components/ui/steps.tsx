"use client";

import { m } from "motion/react";
import { Check } from "lucide-react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Progress indicator for multi-step flows. Completed steps are navigable;
 * future steps are not. A hairline fills as the user advances.
 */
export function Steps({
  steps,
  current,
  onSelect,
  className,
}: {
  steps: string[];
  current: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1;
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <div className="relative mb-4 h-px w-full bg-line">
        <m.div
          className="absolute inset-y-0 left-0 bg-fg"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: ease.out }}
        />
      </div>
      <ol className="no-scrollbar flex gap-5 overflow-x-auto sm:gap-8">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = done && onSelect;
          return (
            <li key={step} className="shrink-0">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onSelect(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "mono flex items-center gap-2 transition-colors disabled:cursor-default",
                  active ? "text-fg" : done ? "text-muted hover:text-fg" : "text-subtle",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border text-[9px] transition-colors",
                    active && "border-fg bg-fg text-bg",
                    done && "border-fg",
                    !active && !done && "border-line-strong",
                  )}
                >
                  {done ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : i + 1}
                </span>
                <span className={cn(!active && "hidden sm:inline")}>{step}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
