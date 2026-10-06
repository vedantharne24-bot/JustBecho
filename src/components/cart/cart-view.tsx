"use client";

import { AnimatePresence } from "motion/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { CartLine } from "./cart-line";
import { SummaryLines, TrustNotes } from "./order-summary";

export function CartView() {
  const hydrated = useHydrated();
  const summary = useCartSummary();
  const blocked = summary.rows.some((r) => r.unavailable);

  if (!hydrated || summary.loading) {
    return (
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12" aria-busy>
        <div className="flex flex-col lg:col-span-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-6 border-b border-line py-7">
              <div className="skeleton h-48 w-[9.5rem]" />
              <div className="flex flex-1 flex-col gap-3">
                <div className="skeleton h-3 w-1/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-72 lg:col-span-4" />
      </div>
    );
  }

  if (summary.empty) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-8 w-8" strokeWidth={1} />}
        title="Your bag is waiting."
        description="Everything you add is held here while you browse. Every piece is authenticated before it ships."
        action={
          <>
            <ButtonLink href="/explore?sort=newest">Shop just in</ButtonLink>
            <ButtonLink href="/wishlist" variant="outline">
              View wishlist
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <p className="mono text-muted">{summary.rows.length} {summary.rows.length === 1 ? "piece" : "pieces"}</p>
          <p className="mono text-muted">Held for you while you browse</p>
        </div>
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {summary.rows.map((row) => (
              <CartLine key={`${row.productId}-${row.size}`} row={row} />
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <aside className="lg:col-span-5 xl:col-span-4">
        <div className="border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:transition-[top] lg:duration-500">
          <h2 className="title">Summary</h2>
          <SummaryLines
            className="mt-6"
            subtotal={summary.subtotal}
            protect={summary.protect}
            shipping={summary.shipping}
            gst={summary.gst}
            total={summary.total}
          />
          {blocked ? (
            <p role="alert" className="mt-5 text-xs text-error">
              Remove sold pieces from your bag to continue.
            </p>
          ) : null}
          <ButtonLink
            href="/checkout"
            size="lg"
            full
            className="mt-7"
            aria-disabled={blocked || summary.purchasable.length === 0}
            icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}
          >
            Secure checkout
          </ButtonLink>
          <p className="mt-4 text-center text-[11px] text-subtle">UPI · Cards · Net banking · No-cost EMI</p>
          <div className="mt-8 border-t border-line pt-6">
            <TrustNotes />
          </div>
        </div>
      </aside>
    </div>
  );
}
