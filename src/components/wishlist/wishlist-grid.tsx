"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Heart, Share2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { toast } from "@/store/toast";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProducts } from "@/hooks/use-products";
import { productDisplayName } from "@/lib/data/brands";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export function WishlistGrid({ compact = false }: { compact?: boolean }) {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const { products, loading } = useProducts(hydrated ? ids : []);

  if (!hydrated || (loading && ids.length)) {
    return (
      <div className={cn("grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5", compact ? "md:grid-cols-3" : "md:grid-cols-4")} aria-busy>
        {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-3 w-1/3" />
            <div className="skeleton mt-2 h-3 w-2/3" />
            <div className="skeleton mt-5 h-11 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-8 w-8" strokeWidth={1} />}
        title="Nothing saved yet."
        description="Tap the heart on any piece to keep it here. We’ll tell you if its price drops or it’s about to sell."
        action={
          <>
            <ButtonLink href="/explore?sort=most-saved">See what others are saving</ButtonLink>
            <ButtonLink href="/explore" variant="outline">
              Explore
            </ButtonLink>
          </>
        }
      />
    );
  }

  const share = async () => {
    const url = `${window.location.origin}/wishlist`;
    try {
      if (navigator.share) await navigator.share({ title: "My JustBecho wishlist", url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Share your wishlist with anyone." });
      }
    } catch {
      /* dismissed */
    }
  };

  const available = products.filter((p) => p.status !== "sold");
  const value = available.reduce((n, p) => n + p.price, 0);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <p className="mono text-muted">
          {products.length} saved · {available.length} available · ₹{value.toLocaleString("en-IN")} in total
        </p>
        <button type="button" onClick={share} className="label flex items-center gap-2 text-muted transition-colors hover:text-fg">
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Share
        </button>
      </div>
      <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-14 sm:gap-x-5", compact ? "md:grid-cols-3" : "md:grid-cols-4")}>
        <AnimatePresence mode="popLayout" initial={false}>
          {products.map((p) => (
            <m.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
            >
              <ProductCard product={p} />
              <MoveToBag product={p} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function MoveToBag({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const remove = useWishlist((s) => s.remove);
  const open = useUI((s) => s.open);
  const inStock = product.sizes.filter((s) => s.stock > 0);
  const [size, setSize] = useState(inStock.length === 1 ? inStock[0].label : "");
  const [error, setError] = useState(false);
  const unavailable = product.status !== "available" || inStock.length === 0;

  const move = () => {
    if (!size) {
      setError(true);
      return;
    }
    const option = product.sizes.find((s) => s.label === size)!;
    add(product.id, size, 1, option.stock);
    remove(product.id);
    toast({ title: "Moved to your bag", description: productDisplayName(product), image: product.images[0].src, action: { label: "View bag", onClick: () => open("cart") } });
  };

  if (unavailable) {
    return (
      <p className="mt-5 flex h-11 items-center justify-center border border-line text-xs text-subtle">
        {product.status === "reserved" ? "Reserved" : "No longer available"}
      </p>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-2">
      {inStock.length > 1 ? (
        <label className="block">
          <span className="sr-only">Size for {product.name}</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setError(false);
            }}
            className={cn(
              "h-11 w-full border bg-transparent px-3 text-xs focus:outline-none",
              error ? "border-error" : "border-line focus:border-fg",
            )}
          >
            <option value="">Select size</option>
            {inStock.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Button size="sm" variant="outline" full onClick={move}>
        Move to bag
      </Button>
    </div>
  );
}
