"use client";

import { useMemo } from "react";
import { useHistory } from "@/store/history";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "./product-card";
import { SectionHeader } from "@/components/ui/misc";

/** Pieces this visitor looked at recently (excluding the current one). */
export function RecentlyViewed({ excludeId, limit = 4, title = "Recently viewed" }: { excludeId?: string; limit?: number; title?: string }) {
  const hydrated = useHydrated();
  const viewed = useHistory((s) => s.viewed);
  const ids = useMemo(() => viewed.filter((id) => id !== excludeId).slice(0, limit), [viewed, excludeId, limit]);
  const { products, loading } = useProducts(hydrated ? ids : []);

  if (!hydrated || ids.length === 0) return null;

  return (
    <section aria-label={title} className="container-x border-t border-line py-20 sm:py-24">
      <SectionHeader eyebrow="Your history" title={<>{title}</>} />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4">
        {loading
          ? ids.map((id) => (
              <div key={id}>
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton mt-4 h-3 w-1/3" />
                <div className="skeleton mt-2 h-3 w-2/3" />
              </div>
            ))
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
