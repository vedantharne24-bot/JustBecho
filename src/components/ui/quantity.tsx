"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  label = "Quantity",
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex h-9 items-center border border-line", className)} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="grid h-full w-9 place-items-center text-muted transition-colors hover:text-fg disabled:opacity-30"
      >
        <Minus className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <output aria-live="polite" className="tabular w-7 text-center text-sm">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="grid h-full w-9 place-items-center text-muted transition-colors hover:text-fg disabled:opacity-30"
      >
        <Plus className="h-3 w-3" strokeWidth={1.5} />
      </button>
    </div>
  );
}
