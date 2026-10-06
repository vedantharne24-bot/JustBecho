"use client";

import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { formatPriceCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

/* Prices span three orders of magnitude, so the track is logarithmic:
   equal distances feel like equal steps from ₹10K to ₹1 Cr. */
const toPos = (price: number, min: number, max: number) =>
  ((Math.log(price) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 1000;
const toPrice = (pos: number, min: number, max: number) => {
  const raw = Math.exp(Math.log(min) + (pos / 1000) * (Math.log(max) - Math.log(min)));
  const magnitude = raw >= 1_00_000 ? 5000 : raw >= 10_000 ? 500 : 100;
  return Math.round(raw / magnitude) * magnitude;
};

const PRESETS = [
  { label: "Under ₹25K", min: undefined, max: 25000 },
  { label: "₹25K–₹1L", min: 25000, max: 100000 },
  { label: "₹1L–₹10L", min: 100000, max: 1000000 },
  { label: "₹10L+", min: 1000000, max: undefined },
];

export function PriceRange({
  bounds,
  value,
  onCommit,
}: {
  bounds: { min: number; max: number };
  value: { min?: number; max?: number };
  onCommit: (value: { min?: number; max?: number }) => void;
}) {
  const lo = Math.max(1000, Math.floor(bounds.min / 1000) * 1000);
  const hi = Math.ceil(bounds.max / 100000) * 100000;
  const fromValue = (): [number, number] => [
    toPos(Math.max(lo, value.min ?? lo), lo, hi),
    toPos(Math.min(hi, value.max ?? hi), lo, hi),
  ];
  const [pos, setPos] = useState<[number, number]>(fromValue);

  // Keep in sync with external changes (chips, presets, back button)
  const syncKey = [value.min, value.max, lo, hi].join("|");
  const [lastKey, setLastKey] = useState(syncKey);
  if (lastKey !== syncKey) {
    setLastKey(syncKey);
    setPos(fromValue());
  }

  const current = { min: toPrice(pos[0], lo, hi), max: toPrice(pos[1], lo, hi) };

  const commit = (p: [number, number]) => {
    const min = p[0] <= 1 ? undefined : toPrice(p[0], lo, hi);
    const max = p[1] >= 999 ? undefined : toPrice(p[1], lo, hi);
    onCommit({ min, max });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between text-sm">
        <output className="tabular">{formatPriceCompact(current.min)}</output>
        <span aria-hidden className="h-px w-6 bg-line-strong" />
        <output className="tabular">
          {formatPriceCompact(current.max)}
          {pos[1] >= 999 ? "+" : ""}
        </output>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        min={0}
        max={1000}
        step={1}
        minStepsBetweenThumbs={20}
        value={pos}
        onValueChange={(v) => setPos([v[0], v[1]])}
        onValueCommit={(v) => commit([v[0], v[1]])}
        aria-label="Price range"
      >
        <Slider.Track className="relative h-px grow bg-line-strong">
          <Slider.Range className="absolute h-px bg-fg" />
        </Slider.Track>
        {["Minimum price", "Maximum price"].map((label) => (
          <Slider.Thumb
            key={label}
            aria-label={label}
            className="block h-4 w-4 rounded-full border border-fg bg-bg shadow-sm transition-transform duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        ))}
      </Slider.Root>
      <div className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = value.min === p.min && value.max === p.max;
          return (
            <button
              key={p.label}
              type="button"
              aria-pressed={active}
              onClick={() => onCommit(active ? {} : { min: p.min, max: p.max })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                active ? "border-fg bg-fg text-bg" : "border-line hover:border-line-strong",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
