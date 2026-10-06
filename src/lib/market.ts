import type { Product } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────────
   Indicative market history for investment pieces. In production this would
   come from the pricing service (completed sales of the same reference);
   here a deterministic series is derived from the listing so it is stable
   between renders and consistent with the current price.
   ────────────────────────────────────────────────────────────────────────── */

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export interface MarketPoint {
  label: string;
  value: number;
}

export function hasMarketHistory(p: Product): boolean {
  return !!p.retailPrice && (p.tags.includes("investment") || p.tags.includes("vault") || p.price >= 1_000_000);
}

export function marketHistory(p: Product, months = 24, now = new Date("2026-10-01")): MarketPoint[] {
  const rand = seeded(p.id);
  const growth = 0.12 + rand() * 0.22; // total appreciation over the window
  const start = p.price / (1 + growth);
  const points: MarketPoint[] = [];
  for (let i = 0; i < months; i++) {
    const t = i / (months - 1);
    // Eased trend with a mid-window plateau and gentle noise
    const trend = start + (p.price - start) * (t * t * (3 - 2 * t));
    const noise = i === months - 1 ? 0 : (rand() - 0.5) * 0.045 * p.price;
    const date = new Date(now);
    date.setMonth(now.getMonth() - (months - 1 - i));
    points.push({
      label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      value: Math.round((trend + noise) / 1000) * 1000,
    });
  }
  points[points.length - 1].value = p.price;
  return points;
}
