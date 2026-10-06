"use client";

import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { COMMISSION_TIERS, commissionFor } from "@/lib/fees";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Jordan 1", price: 28000 },
  { label: "GG Marmont", price: 105000 },
  { label: "Submariner", price: 1425000 },
  { label: "Kelly 28", price: 1980000 },
];

const MIN = 5000;
const MAX = 5000000;
const toPos = (v: number) => (Math.log(v / MIN) / Math.log(MAX / MIN)) * 1000;
const toPrice = (p: number) => {
  const raw = MIN * Math.pow(MAX / MIN, p / 1000);
  const step = raw > 500000 ? 10000 : raw > 50000 ? 1000 : 500;
  return Math.round(raw / step) * step;
};

/** Interactive payout estimate using the live commission schedule. */
export function EarningsCalculator() {
  const [price, setPrice] = useState(105000);
  const [input, setInput] = useState("1,05,000");
  const { rate, fee, payout } = commissionFor(price);
  const consignment = Math.round(price * 0.7);

  const setFromInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setInput(digits ? Number(digits).toLocaleString("en-IN") : "");
    const n = Number(digits);
    if (n >= MIN) setPrice(Math.min(n, 50_000_000));
  };

  const setFromNumber = (n: number) => {
    setPrice(n);
    setInput(n.toLocaleString("en-IN"));
  };

  return (
    <div className="grid grid-cols-1 gap-10 border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <label htmlFor="calc-price" className="label text-muted">
          Your selling price
        </label>
        <div className="mt-3 flex items-baseline gap-2 border-b border-line-strong focus-within:border-fg">
          <span className="price text-4xl text-muted">₹</span>
          <input
            id="calc-price"
            inputMode="numeric"
            value={input}
            onChange={(e) => setFromInput(e.target.value)}
            onBlur={() => setInput(price.toLocaleString("en-IN"))}
            className="price min-w-0 flex-1 bg-transparent py-2 text-5xl leading-none tracking-tight focus:outline-none"
          />
        </div>
        <Slider.Root
          className="relative mt-8 flex h-5 w-full touch-none select-none items-center"
          min={0}
          max={1000}
          value={[toPos(Math.min(Math.max(price, MIN), MAX))]}
          onValueChange={([v]) => setFromNumber(toPrice(v))}
          aria-label="Selling price"
        >
          <Slider.Track className="relative h-px grow bg-line-strong">
            <Slider.Range className="absolute h-px bg-fg" />
          </Slider.Track>
          <Slider.Thumb className="block h-5 w-5 rounded-full border border-fg bg-bg transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent" />
        </Slider.Root>
        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setFromNumber(p.price)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                price === p.price ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-8">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Sale price</dt>
            <dd className="tabular">{formatPrice(price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Commission ({Math.round(rate * 100)}%)</dt>
            <dd className="tabular">− {formatPrice(fee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Authentication, photography, shipping</dt>
            <dd>Included</dd>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-5">
            <dt className="label">You receive</dt>
            <dd className="price text-[2.75rem] leading-none tracking-tight">{formatPrice(payout)}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line">
              <span className="block h-full bg-fg" style={{ width: `${(payout / price) * 100}%` }} />
            </span>
            {Math.round((payout / price) * 100)}% to you
          </div>
          <p className="text-xs text-muted">
            A typical consignment store pays around {formatPrice(consignment)} for the same piece. You keep{" "}
            <span className="text-fg">{formatPrice(Math.max(0, payout - consignment))}</span> more.
          </p>
          <p className="mono text-subtle">
            Tier: {COMMISSION_TIERS.find((t) => price <= t.upTo)?.label}
          </p>
        </div>
      </div>
    </div>
  );
}
