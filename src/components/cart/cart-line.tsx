"use client";

import Link from "next/link";
import Image from "next/image";
import { m } from "motion/react";
import { ShieldCheck } from "lucide-react";
import type { CartRow } from "@/hooks/use-cart-summary";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "@/store/toast";
import { getBrandName, productDisplayName } from "@/lib/data/brands";
import { conditionMap } from "@/lib/conditions";
import { formatPrice } from "@/lib/format";
import { PROTECT_FEE } from "@/lib/orders";
import { ease } from "@/lib/motion";
import { QuantityStepper } from "@/components/ui/quantity";
import { cn } from "@/lib/utils";

export function CartLine({ row, compact = false, onNavigate }: { row: CartRow; compact?: boolean; onNavigate?: () => void }) {
  const { product } = row;
  const brand = getBrandName(product.brand);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const setSize = useCart((s) => s.setSize);
  const toggleProtect = useCart((s) => s.toggleProtect);
  const addToWishlist = useWishlist((s) => s.add);
  const href = `/product/${product.slug}`;
  const sizeOptions = product.sizes.filter((s) => s.stock > 0 || s.label === row.size);

  const onRemove = () => {
    remove(row.productId, row.size);
    toast({
      title: "Removed from your bag",
      description: productDisplayName(product),
      action: { label: "Undo", onClick: () => add(row.productId, row.size, row.quantity) },
    });
  };

  const onSave = () => {
    addToWishlist(row.productId);
    remove(row.productId, row.size);
    toast({ title: "Moved to wishlist", description: productDisplayName(product), action: { label: "View", href: "/wishlist" } });
  };

  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.3, ease: ease.inOut } }}
      className={cn("flex gap-4 border-b border-line py-5 sm:gap-6", compact ? "py-5" : "sm:py-7")}
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={cn("relative shrink-0 overflow-hidden bg-media", compact ? "h-[120px] w-24" : "h-36 w-28 sm:h-48 sm:w-[9.5rem]")}
      >
        <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="160px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label">{brand}</p>
            <Link href={href} onClick={onNavigate} className="mt-1 block truncate text-sm text-muted hover:text-fg">
              {product.name}
            </Link>
          </div>
          <p className="tabular shrink-0 text-sm">{formatPrice(product.price * row.quantity)}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          {sizeOptions.length > 1 && !compact ? (
            <label className="flex items-center gap-2">
              <span className="sr-only">Size</span>
              <select
                value={row.size}
                onChange={(e) => setSize(row.productId, row.size, e.target.value)}
                className="cursor-pointer border-b border-line bg-transparent pb-0.5 text-xs text-fg focus:outline-none"
              >
                {sizeOptions.map((s) => (
                  <option key={s.label} value={s.label} disabled={s.stock === 0}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span>{row.size}</span>
          )}
          <span aria-hidden className="h-3 w-px bg-line-strong" />
          <span>{conditionMap[product.condition].label}</span>
        </div>

        {row.unavailable ? (
          <p className="mt-3 text-xs text-error">This piece has just sold. Remove it to continue.</p>
        ) : (
          <button
            type="button"
            disabled={row.protectIncluded}
            onClick={() => toggleProtect(row.productId, row.size)}
            aria-pressed={row.protect}
            className={cn(
              "mt-3 flex w-fit items-center gap-2 text-left text-xs transition-colors",
              row.protect ? "text-fg" : "text-subtle hover:text-muted",
            )}
          >
            <ShieldCheck aria-hidden className={cn("h-3.5 w-3.5", row.protect && "text-accent")} strokeWidth={1.5} />
            {row.protectIncluded ? (
              <span>Becho Protect · Complimentary</span>
            ) : row.protect ? (
              <span>
                Becho Protect · {formatPrice(PROTECT_FEE)} <span className="text-subtle underline underline-offset-2">Remove</span>
              </span>
            ) : (
              <span>
                Add Becho Protect authentication · {formatPrice(PROTECT_FEE)}
              </span>
            )}
          </button>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          {row.maxQuantity > 1 ? (
            <QuantityStepper
              value={row.quantity}
              max={row.maxQuantity}
              onChange={(q) => setQuantity(row.productId, row.size, q)}
            />
          ) : (
            <span className="mono text-subtle">One of one</span>
          )}
          <div className="flex items-center gap-4">
            <button type="button" onClick={onSave} className="label link-draw text-muted hover:text-fg">
              Save
            </button>
            <button type="button" onClick={onRemove} className="label link-draw text-muted hover:text-fg">
              Remove
            </button>
          </div>
        </div>
      </div>
    </m.li>
  );
}
