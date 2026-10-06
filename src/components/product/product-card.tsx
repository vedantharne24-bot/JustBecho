import Link from "next/link";
import Image from "next/image";
import { ViewTransition } from "react";
import type { Product } from "@/lib/types";
import { getBrandName, productDisplayName } from "@/lib/data/brands";
import { conditionMap } from "@/lib/conditions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";

/**
 * Product tile. Server-renderable; only the wishlist control hydrates.
 * Hover reveals the second photograph and a line of availability.
 */
export function ProductCard({
  product,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw",
  morph = false,
  eager = false,
  className,
}: {
  product: Product;
  sizes?: string;
  morph?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const brand = getBrandName(product.brand);
  const [primary, secondary] = product.images;
  const sold = product.status === "sold";
  const reserved = product.status === "reserved";
  const inStock = product.sizes.filter((s) => s.stock > 0);
  const sizeLine =
    product.sizes.length === 1
      ? product.sizes[0].label === "One size"
        ? `Ships from ${product.shipsFrom}`
        : product.sizes[0].label
      : inStock.map((s) => s.label.replace(/^(UK|EU|IT) /, "")).join(" · ");
  const sizePrefix = product.sizes.length > 1 ? product.sizeSystem : "";

  const media = (
    <div className="relative aspect-[4/5] overflow-hidden bg-media">
      <Image
        src={primary.src}
        alt={primary.alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        placeholder={primary.blur ? "blur" : "empty"}
        blurDataURL={primary.blur}
        className={cn(
          "object-cover transition-[transform,opacity,filter] duration-[1400ms] ease-out will-change-transform group-hover:scale-[1.045]",
          secondary && "group-hover:opacity-0",
          sold && "grayscale-[0.6]",
        )}
      />
      {secondary ? (
        <Image
          src={secondary.src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          loading="lazy"
          className="scale-[1.06] object-cover opacity-0 transition-[transform,opacity] duration-[1400ms] ease-out group-hover:scale-100 group-hover:opacity-100"
        />
      ) : null}
    </div>
  );

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={`/product/${product.slug}`}
        data-cursor="View"
        className="block focus-visible:outline-offset-4"
        aria-label={`${productDisplayName(product)}, ${formatPrice(product.price)}`}
      >
        <div className="relative overflow-hidden">
          {morph ? (
            <ViewTransition name={`media-${product.id}`} share="media-morph" default="none">
              {media}
            </ViewTransition>
          ) : (
            media
          )}

          {sold || reserved ? (
            <span
              className={cn(
                "mono absolute left-3 top-3 px-2 py-1 text-[10px]",
                sold ? "bg-ink text-ivory" : "bg-paper text-ink",
              )}
            >
              {sold ? "Sold" : "Reserved"}
            </span>
          ) : product.authentication.status === "in-review" ? (
            <span className="mono absolute left-3 top-3 bg-paper/90 px-2 py-1 text-[10px] text-ink">In authentication</span>
          ) : null}

          {!sold ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full items-center justify-between bg-paper/95 px-3 py-2.5 text-ink transition-transform duration-500 ease-out group-hover:translate-y-0 lg:flex">
              <span className="mono text-[10px] text-stone">{sizePrefix || "Available"}</span>
              <span className="mono truncate pl-3 text-[10px]">{sizeLine}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label truncate text-fg">{brand}</p>
            <h3 className="mt-1.5 line-clamp-1 text-[0.8125rem] leading-snug text-muted">{product.name}</h3>
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between gap-3">
          <span className={cn("tabular text-[0.875rem]", sold ? "text-subtle line-through" : "text-fg")}>
            {formatPrice(product.price)}
          </span>
          <span className="truncate text-[0.6875rem] text-subtle">{conditionMap[product.condition].label}</span>
        </div>
      </Link>

      <WishlistButton
        productId={product.id}
        productName={productDisplayName(product)}
        image={primary.src}
        className="absolute right-1.5 top-1.5 z-10"
      />
    </article>
  );
}
