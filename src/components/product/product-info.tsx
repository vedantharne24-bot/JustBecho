"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m, useAnimationControls } from "motion/react";
import { BadgeCheck, MapPin, PackageCheck, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import type { Brand, Product, Seller } from "@/lib/types";
import { conditionMap, CONDITIONS } from "@/lib/conditions";
import { productDisplayName } from "@/lib/data/brands";
import { formatDate, formatDay, formatPrice, percentOff } from "@/lib/format";
import { DELIVERY_OPTIONS, PROTECT_FEE, PROTECT_INCLUDED_ABOVE, deliveryWindow } from "@/lib/orders";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useAccount } from "@/store/account";
import { useHistory } from "@/store/history";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "@/store/toast";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Seal } from "@/components/ui/seal";
import { WishlistButton } from "./wishlist-button";
import { AskSpecialist } from "@/components/concierge/ask-specialist";
import { PrivateViewing } from "@/components/concierge/private-viewing";

export function ProductInfo({ product, brand, seller }: { product: Product; brand: Brand; seller: Seller }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const addToCart = useCart((s) => s.add);
  const cartLines = useCart((s) => s.lines);
  const toggleProtect = useCart((s) => s.toggleProtect);
  const openOverlay = useUI((s) => s.open);
  const pushViewed = useHistory((s) => s.pushViewed);
  const defaultAddress = useAccount((s) => s.addresses.find((a) => a.isDefault));

  const sizeOptions = product.sizes;
  const single = sizeOptions.length === 1;
  const [size, setSize] = useState<string | null>(single ? sizeOptions[0].label : null);
  const [sizeError, setSizeError] = useState(false);
  const [protect, setProtect] = useState(true);
  const sizeControls = useAnimationControls();
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  const sold = product.status === "sold";
  const reserved = product.status === "reserved";
  const purchasable = !sold && !reserved;
  const protectIncluded = product.price >= PROTECT_INCLUDED_ABOVE;
  const off = percentOff(product.price, product.retailPrice);
  const emi = product.price >= 10000 ? Math.ceil(product.price / 9 / 100) * 100 : null;
  const condition = conditionMap[product.condition];
  const inBag = hydrated && cartLines.some((l) => l.productId === product.id && (!size || l.size === size));

  useEffect(() => {
    pushViewed(product.id);
  }, [product.id, pushViewed]);

  // Mobile purchase bar appears once the main CTA scrolls away
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const requireSize = () => {
    if (size) return true;
    setSizeError(true);
    sizeControls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } });
    document.getElementById("size-selector")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return false;
  };

  const add = (thenCheckout = false) => {
    if (!purchasable || !requireSize()) return;
    const option = sizeOptions.find((s) => s.label === size)!;
    addToCart(product.id, option.label, 1, option.stock);
    // Respect the buyer's Protect choice for this line
    const line = useCart.getState().lines.find((l) => l.productId === product.id && l.size === option.label);
    if (line && !protectIncluded && line.protect !== protect) toggleProtect(product.id, option.label);
    if (thenCheckout) {
      router.push("/checkout");
    } else {
      openOverlay("cart");
    }
  };

  return (
    <div className="lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:transition-[top] lg:duration-500">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <Link href={`/brands/${brand.slug}`} className="label link-draw">
            {brand.name}
          </Link>
          <h1 className="display-sm mt-3 text-balance">{product.name}</h1>
          <p className="mono mt-3 text-muted">
            {product.subcategory} · {product.colour}
            {product.year ? ` · ${product.year}` : ""}
          </p>
        </div>
        <WishlistButton
          productId={product.id}
          productName={productDisplayName(product)}
          image={product.images[0].src}
          variant="inline"
          className="hidden shrink-0 sm:grid"
        />
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
        <div>
          <p className={cn("price text-[2.25rem] leading-none tracking-tight", sold && "text-subtle line-through")}>
            {formatPrice(product.price)}
          </p>
          <p className="mt-2 text-xs text-muted">
            {product.retailPrice ? (
              <>
                Retail {formatPrice(product.retailPrice)}
                {off ? <span className="ml-2 text-accent">{off}% below retail</span> : null}
              </>
            ) : (
              "No longer available at retail"
            )}
          </p>
        </div>
        {emi && purchasable ? (
          <p className="text-xs text-muted">
            or <span className="text-fg">{formatPrice(emi)}/mo</span> · No-cost EMI
          </p>
        ) : null}
      </div>

      {/* Condition */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <p className="label">Condition</p>
          <p className="text-sm">{condition.label}</p>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1" aria-hidden>
          {[...CONDITIONS].reverse().map((c) => (
            <span key={c.value} className={cn("h-[3px]", c.grade <= condition.grade ? "bg-fg" : "bg-line-strong")} />
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">{product.conditionNotes}</p>
      </div>

      {/* Size */}
      {!single || product.sizeSystem !== "One size" ? (
        <m.fieldset id="size-selector" animate={sizeControls} className="mt-8">
          <legend className="flex w-full items-baseline justify-between">
            <span className="label">{single ? "Size" : `Size · ${product.sizeSystem}`}</span>
            {sizeError && !size ? (
              <span role="alert" className="text-xs text-error">
                Select a size to continue
              </span>
            ) : !single ? (
              <span className="text-xs text-muted">Fits true to size</span>
            ) : null}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {sizeOptions.map((s) => {
              const out = s.stock === 0;
              const selected = size === s.label;
              return (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={out || single}
                  onClick={() => {
                    setSize(s.label);
                    setSizeError(false);
                  }}
                  className={cn(
                    "relative h-11 min-w-14 border px-3 text-sm transition-colors duration-200",
                    selected ? "border-fg bg-fg text-bg" : "border-line-strong hover:border-fg",
                    out && "cursor-not-allowed border-line text-subtle line-through decoration-[0.5px]",
                    single && "cursor-default",
                    sizeError && !size && !out && "border-error",
                  )}
                >
                  {s.label.replace(/^(UK|EU|IT) /, "")}
                  {!out && s.stock === 1 && !single ? (
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent" title="Last one" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {!single && size && sizeOptions.find((s) => s.label === size)?.stock === 1 ? (
            <p className="mt-3 text-xs text-muted">Only one in this size.</p>
          ) : null}
        </m.fieldset>
      ) : null}

      {/* Becho Protect */}
      <div className="mt-8 border border-line p-5">
        <div className="flex items-start gap-4">
          <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.25} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm">Becho Protect</p>
              <p className="text-sm">{protectIncluded ? "Complimentary" : formatPrice(PROTECT_FEE)}</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Hand authentication at our Mumbai hub, a tamper-evident seal, a digital certificate and a full money-back
              guarantee.
            </p>
            {!protectIncluded && purchasable ? (
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={protect}
                  onChange={(e) => setProtect(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--c-ink)]"
                />
                Add Becho Protect to this piece
              </label>
            ) : null}
            {!protect && !protectIncluded ? (
              <p className="mt-2 text-xs text-warning">Without Protect, the piece ships directly from the seller.</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div ref={ctaRef} className="mt-6 flex flex-col gap-3">
        {sold ? (
          <>
            <p className="text-sm text-muted">This piece has found a new home. Similar pieces are below.</p>
            <Button
              variant="outline"
              full
              size="lg"
              onClick={() =>
                toast({ title: "We’ll let you know", description: `When another ${brand.name} ${product.subcategory.toLowerCase()} arrives.` })
              }
            >
              Notify me of similar pieces
            </Button>
          </>
        ) : reserved ? (
          <>
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 animate-[pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-accent" />
              Reserved — another client is completing checkout.
            </p>
            <Button
              variant="outline"
              full
              size="lg"
              onClick={() => toast({ title: "You’re on the waitlist", description: "If checkout isn’t completed, it’s yours first." })}
            >
              Join the waitlist
            </Button>
          </>
        ) : (
          <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-2">
            <Button size="lg" full onClick={() => add(false)}>
              {inBag ? "Add another" : "Add to bag"}
            </Button>
            <Button size="lg" variant="accent" full onClick={() => add(true)} className="hidden sm:inline-flex">
              Buy now
            </Button>
            <WishlistButton
              productId={product.id}
              productName={productDisplayName(product)}
              image={product.images[0].src}
              variant="inline"
              className="h-14 w-14 sm:hidden"
            />
          </div>
        )}
      </div>

      <DeliveryCheck defaultPincode={hydrated ? defaultAddress?.pincode : undefined} shipsFrom={product.shipsFrom} />

      <ul className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-5 text-center">
        {[
          { icon: BadgeCheck, label: "Authenticated by hand" },
          { icon: Truck, label: "Insured delivery" },
          { icon: RotateCcw, label: "Money-back guarantee" },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-2">
            <Icon aria-hidden className="h-4 w-4 text-muted" strokeWidth={1.25} />
            <span className="text-[11px] leading-tight text-muted">{label}</span>
          </li>
        ))}
      </ul>

      <SellerCard seller={seller} />

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        <AskSpecialist productName={productDisplayName(product)} productSlug={product.slug} specialist={product.authentication.authenticator} />
        {product.price >= 1_000_000 || product.tags.includes("vault") ? (
          <PrivateViewing productName={productDisplayName(product)} productSlug={product.slug} />
        ) : null}
      </div>

      <Accordion
        className="mt-8"
        defaultOpen={["details"]}
        items={[
          {
            id: "details",
            title: "Details",
            content: (
              <div>
                <p className="text-fg/85">{product.description}</p>
                <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[0.8125rem]">
                  {[
                    { label: "Material", value: product.material },
                    { label: "Colour", value: product.colour },
                    ...product.details,
                    ...(product.year ? [{ label: "Year", value: product.year }] : []),
                    { label: "Includes", value: product.includes.join(", ") || "Piece only" },
                    { label: "Listing", value: product.id.toUpperCase() },
                  ].map((d) => (
                    <div key={d.label} className="contents">
                      <dt className="text-subtle">{d.label}</dt>
                      <dd className="text-fg">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ),
          },
          {
            id: "condition",
            title: "Condition report",
            meta: condition.label,
            content: (
              <div className="flex flex-col gap-3">
                <p className="text-fg/85">{product.conditionNotes}</p>
                <p>
                  <span className="text-fg">{condition.label}:</span> {condition.description}
                </p>
                <Link href="/help#condition" className="link-undraw w-fit text-xs text-fg">
                  Read our condition guide
                </Link>
              </div>
            ),
          },
          {
            id: "auth",
            title: "Authentication",
            meta: product.authentication.status === "authenticated" ? "Verified" : "In progress",
            content: <Certificate product={product} brand={brand} />,
          },
          {
            id: "shipping",
            title: "Delivery & returns",
            content: (
              <ul className="flex flex-col gap-3">
                <li className="flex gap-3">
                  <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.25} />
                  Ships from {product.shipsFrom} to the Becho Hub, then to you in insured, tamper-evident packaging.
                </li>
                <li className="flex gap-3">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.25} />
                  Complimentary insured delivery across India. Priority authentication available at checkout.
                </li>
                <li className="flex gap-3">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.25} />
                  If a piece isn’t as described, return it within 48 hours of delivery for a full refund.
                </li>
              </ul>
            ),
          },
        ]}
      />

      {/* Mobile purchase bar */}
      <AnimatePresence>
        {showBar && purchasable ? (
          <m.div
            initial={{ y: "110%" }}
            animate={{ y: 0, transition: { duration: 0.5, ease: ease.out } }}
            exit={{ y: "110%", transition: { duration: 0.3 } }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-xl lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted">{brand.name}</p>
              <p className="tabular text-sm">{formatPrice(product.price)}</p>
            </div>
            <Button onClick={() => add(false)} size="md">
              Add to bag
            </Button>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DeliveryCheck({ defaultPincode, shipsFrom }: { defaultPincode?: string; shipsFrom: string }) {
  const [pincode, setPincode] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from the default address once it's known (adjusting state during render)
  const [seeded, setSeeded] = useState(false);
  if (defaultPincode && !seeded) {
    setSeeded(true);
    if (!pincode) {
      setPincode(defaultPincode);
      setChecked(defaultPincode);
    }
  }

  const windows = useMemo(
    () => DELIVERY_OPTIONS.map((o) => ({ ...o, window: deliveryWindow(o.value) })),
    [],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode");
      setChecked(null);
      return;
    }
    setError(null);
    setChecked(pincode);
  };

  return (
    <div className="mt-8">
      <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-line-strong focus-within:border-fg">
        <MapPin aria-hidden className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.25} />
        <label htmlFor="pincode" className="sr-only">
          Delivery pincode
        </label>
        <input
          id="pincode"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            setError(null);
          }}
          placeholder="Enter pincode for delivery dates"
          aria-invalid={!!error}
          className="h-12 min-w-0 flex-1 bg-transparent text-sm placeholder:text-subtle focus:outline-none"
        />
        <button type="submit" className="label link-undraw shrink-0">
          Check
        </button>
      </form>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : null}
      <AnimatePresence initial={false}>
        {checked ? (
          <m.ul
            key={checked}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col gap-2 text-xs"
          >
            {windows.map((w) => (
              <li key={w.value} className="flex justify-between gap-4">
                <span className="text-muted">
                  {w.label}
                  {w.price ? ` · ${formatPrice(w.price)}` : " · Free"}
                </span>
                <span>
                  {formatDay(w.window.start)} – {formatDay(w.window.end)}
                </span>
              </li>
            ))}
            <li className="text-subtle">
              Ships from {shipsFrom} via the Becho Hub to {checked}.
            </li>
          </m.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SellerCard({ seller }: { seller: Seller }) {
  const initials = seller.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="mt-8 flex items-center gap-4">
      <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-2 text-base tracking-wide">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm">
          {seller.name}
          {seller.verified ? <BadgeCheck aria-label="Verified seller" className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} /> : null}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Star aria-hidden className="h-3 w-3 fill-current" strokeWidth={0} />
            {seller.rating.toFixed(1)} ({seller.reviews})
          </span>
          <span>{seller.sales.toLocaleString("en-IN")} sold</span>
          <span>{seller.location}</span>
        </p>
      </div>
      <p className="hidden text-right text-[11px] leading-snug text-subtle sm:block">
        Replies
        <br />
        {seller.responseTime.toLowerCase()}
      </p>
    </div>
  );
}

function Certificate({ product, brand }: { product: Product; brand: Brand }) {
  const auth = product.authentication;
  if (auth.status !== "authenticated") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-fg/85">
          This piece is with our specialists now. Authentication typically completes within 48 hours, and you can still
          reserve it — you’ll only be charged if it passes.
        </p>
        <p className="mono text-subtle">Reference {auth.certificateId}</p>
      </div>
    );
  }
  return (
    <div className="theme-dark relative overflow-hidden border border-line p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono text-muted">Certificate of authenticity</p>
          <p className="mono mt-1 text-fg">{auth.certificateId}</p>
        </div>
        <Seal className="-mr-1 -mt-1 w-16 text-champagne" spin={false} />
      </div>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-xs">
        <dt className="text-muted">Piece</dt>
        <dd className="text-fg">
          {brand.name} {product.name}
        </dd>
        <dt className="text-muted">Verified</dt>
        <dd className="text-fg">{auth.authenticatedOn ? formatDate(auth.authenticatedOn) : "—"}</dd>
        <dt className="text-muted">Specialist</dt>
        <dd className="text-fg">{auth.authenticator}</dd>
      </dl>
      <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
        {auth.checks.map((c) => (
          <li key={c} className="flex items-center gap-2 text-xs text-fg/85">
            <span className="h-1 w-1 rounded-full bg-[var(--c-seal-bright)]" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
