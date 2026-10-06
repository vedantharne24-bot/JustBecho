"use client";

import { AnimatePresence } from "motion/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useUI } from "@/store/ui";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { Sheet } from "@/components/ui/sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { CartLine } from "./cart-line";

export function CartDrawer() {
  const isOpen = useUI((s) => s.overlay === "cart");
  const close = useUI((s) => s.close);
  const hydrated = useHydrated();
  const summary = useCartSummary();

  const count = summary.rows.reduce((n, r) => n + r.quantity, 0);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(o) => !o && close()}
      title={count ? `Your bag (${count})` : "Your bag"}
      description={count ? "Every piece is reserved for 30 minutes once you check out." : undefined}
      footer={
        hydrated && !summary.empty ? (
          <div className="flex flex-col gap-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular">{formatPrice(summary.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Becho Protect</dt>
                <dd className="tabular">{summary.protect ? formatPrice(summary.protect) : "Complimentary"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Insured delivery</dt>
                <dd>Complimentary</dd>
              </div>
            </dl>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href="/cart" variant="outline" onClick={close} full>
                View bag
              </ButtonLink>
              <ButtonLink
                href="/checkout"
                onClick={close}
                full
                aria-disabled={summary.purchasable.length === 0}
                icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}
              >
                Checkout
              </ButtonLink>
            </div>
            <p className="text-center text-[11px] text-subtle">GST on service fees is calculated at checkout.</p>
          </div>
        ) : null
      }
    >
      {!hydrated || summary.loading ? (
        <ul aria-busy className="flex flex-col">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="flex gap-4 border-b border-line py-5">
              <div className="skeleton h-[120px] w-24" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton mt-auto h-3 w-1/4" />
              </div>
            </li>
          ))}
        </ul>
      ) : summary.empty ? (
        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-8 w-8 text-subtle" strokeWidth={1} />
          <p className="font-display mt-6 text-3xl">Your bag is empty.</p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Pieces you add are held here. Each one is authenticated before it ships.
          </p>
          <div className="mt-8 flex gap-3">
            <ButtonLink href="/explore?sort=newest" onClick={close}>
              Shop just in
            </ButtonLink>
            <Button variant="outline" onClick={close}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {summary.rows.map((row) => (
              <CartLine key={`${row.productId}-${row.size}`} row={row} compact onNavigate={close} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Sheet>
  );
}
