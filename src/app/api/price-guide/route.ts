import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";

/**
 * GET /api/price-guide?brand=hermes&category=bags
 * Price range of comparable pieces, used to guide sellers while listing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");

  let comps = products.filter((p) => p.brand === brand && p.category === category);
  let basis: "brand-category" | "category" = "brand-category";
  if (comps.length < 2) {
    comps = products.filter((p) => p.category === category);
    basis = "category";
  }
  if (!comps.length) return NextResponse.json({ count: 0 });

  const prices = comps.map((p) => p.price).sort((a, b) => a - b);
  // Linear-interpolated quantile, rounded to a sensible step
  const q = (f: number) => {
    const pos = f * (prices.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(prices.length - 1, lo + 1);
    const value = prices[lo] + (prices[hi] - prices[lo]) * (pos - lo);
    return Math.round(value / 1000) * 1000;
  };
  return NextResponse.json({
    count: comps.length,
    basis,
    low: q(0.2),
    median: q(0.5),
    high: q(0.8),
    examples: comps.slice(0, 3).map((p) => ({ name: p.name, price: p.price, status: p.status })),
  });
}
