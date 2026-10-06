"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

/* Client-side product lookup with a session cache. Components that hold
   product ids in local state (cart, wishlist, history, orders) resolve them
   through `/api/products`, mirroring how a real storefront would. */

const cache = new Map<string, Product>();
const inflight = new Map<string, Promise<void>>();

async function load(ids: string[]): Promise<void> {
  const missing = ids.filter((id) => !cache.has(id) && !inflight.has(id));
  if (missing.length === 0) {
    await Promise.all(ids.map((id) => inflight.get(id)).filter(Boolean));
    return;
  }
  const request = fetch(`/api/products?ids=${encodeURIComponent(missing.join(","))}`)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load products (${r.status})`);
      return r.json() as Promise<{ products: Product[] }>;
    })
    .then(({ products }) => {
      for (const p of products) cache.set(p.id, p);
    })
    .finally(() => missing.forEach((id) => inflight.delete(id)));
  missing.forEach((id) => inflight.set(id, request));
  await Promise.all([request, ...ids.map((id) => inflight.get(id)).filter(Boolean)]);
}

export function primeProducts(products: Product[]) {
  for (const p of products) cache.set(p.id, p);
}

export function useProducts(ids: string[]): {
  products: Product[];
  map: Record<string, Product>;
  loading: boolean;
  error: string | null;
} {
  const key = ids.join(",");
  const [, force] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ready = ids.every((id) => cache.has(id));

  useEffect(() => {
    if (!key) return;
    const list = key.split(",");
    if (list.every((id) => cache.has(id))) return;
    let cancelled = false;
    load(list)
      .then(() => !cancelled && force((n) => n + 1))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [key]);

  return useMemo(() => {
    const list = key ? key.split(",") : [];
    const products = list.map((id) => cache.get(id)).filter((p): p is Product => !!p);
    return {
      products,
      map: Object.fromEntries(products.map((p) => [p.id, p])),
      loading: !ready && !error,
      error,
    };
  }, [key, ready, error]);
}
