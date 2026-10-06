"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import type { CartRow } from "@/hooks/use-cart-summary";
import { getBrandName } from "@/lib/data/brands";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SummaryLines({
  subtotal,
  protect,
  shipping,
  gst,
  total,
  shippingLabel = "Insured delivery",
  className,
}: {
  subtotal: number;
  protect: number;
  shipping: number;
  gst: number;
  total: number;
  shippingLabel?: string;
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-col gap-3 text-sm", className)}>
      <Row label="Subtotal" value={formatPrice(subtotal)} />
      <Row label="Becho Protect" value={protect ? formatPrice(protect) : "Complimentary"} />
      <Row label={shippingLabel} value={shipping ? formatPrice(shipping) : "Complimentary"} />
      <Row label="GST on service fees (18%)" value={gst ? formatPrice(gst) : "—"} muted />
      <div className="mt-2 flex items-baseline justify-between border-t border-line pt-5">
        <dt className="label">Total</dt>
        <dd className="price text-[1.75rem] leading-none">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn(muted ? "text-subtle" : "text-muted")}>{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  );
}

export function SummaryItems({ rows }: { rows: CartRow[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r) => (
        <li key={`${r.productId}-${r.size}`} className="flex items-center gap-4">
          <span className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden bg-media">
            <Image src={r.product.images[0].src} alt="" fill sizes="56px" className="object-cover" />
            {r.quantity > 1 ? (
              <span className="tabular absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] text-ivory">
                {r.quantity}
              </span>
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="label block truncate">{getBrandName(r.product.brand)}</span>
            <span className="mt-1 block truncate text-xs text-muted">
              {r.product.name} · {r.size}
            </span>
          </span>
          <span className="tabular text-sm">{formatPrice(r.product.price * r.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

export function TrustNotes({ children }: { children?: ReactNode }) {
  return (
    <ul className="flex flex-col gap-3 text-xs text-muted">
      <li className="flex gap-3">
        <ShieldCheck aria-hidden className="h-4 w-4 shrink-0 text-fg" strokeWidth={1.25} />
        Every piece is authenticated at the Becho Hub before dispatch. If it fails, you’re refunded in full.
      </li>
      <li className="flex gap-3">
        <Lock aria-hidden className="h-4 w-4 shrink-0 text-fg" strokeWidth={1.25} />
        Payments are processed by a PCI-DSS certified partner. We never see or store your card details.
      </li>
      {children}
    </ul>
  );
}
