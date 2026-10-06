"use client";

import { m, useAnimationControls } from "motion/react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "@/store/toast";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  image,
  className,
  variant = "overlay",
}: {
  productId: string;
  productName: string;
  image?: string;
  className?: string;
  variant?: "overlay" | "inline";
}) {
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const controls = useAnimationControls();
  const isSaved = hydrated && saved;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(productId);
    if (added) {
      controls.start({ scale: [1, 1.35, 0.92, 1], transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } });
      toast({ title: "Saved to your wishlist", description: productName, image, action: { label: "View", href: "/wishlist" } });
    } else {
      controls.start({ scale: [1, 0.85, 1], transition: { duration: 0.3 } });
      toast({
        title: "Removed from wishlist",
        description: productName,
        action: { label: "Undo", onClick: () => useWishlist.getState().add(productId) },
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn(
        "group/heart grid place-items-center transition-colors",
        variant === "overlay" && "h-10 w-10 rounded-full text-ink hover:bg-paper/70",
        variant === "inline" && "h-12 w-12 border border-line-strong text-fg hover:border-fg",
        className,
      )}
    >
      <m.span animate={controls} className="grid place-items-center">
        <Heart
          aria-hidden
          strokeWidth={1.25}
          className={cn(
            "h-[18px] w-[18px] transition-[fill,color] duration-300",
            isSaved ? "fill-seal text-seal" : "fill-transparent",
          )}
        />
      </m.span>
    </button>
  );
}
