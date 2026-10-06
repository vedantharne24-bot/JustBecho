"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { m } from "motion/react";
import { ArrowLeft, Check, FileText, MapPin, ShieldCheck } from "lucide-react";
import { useAccount } from "@/store/account";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProducts } from "@/hooks/use-products";
import { ORDER_STAGES, currentStage, stageIndex, stageTimes } from "@/lib/orders";
import { formatDate, formatDay, formatPrice, formatTime } from "@/lib/format";
import { getBrandName, productDisplayName } from "@/lib/data/brands";
import { PAYMENT_METHODS } from "@/lib/payments";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Seal } from "@/components/ui/seal";
import { SummaryLines } from "@/components/cart/order-summary";

export function OrderTracking({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useAccount((s) => s.orders.find((o) => o.id === id));
  const [now, setNow] = useState(() => Date.now());
  const [certFor, setCertFor] = useState<string | null>(null);
  const { map } = useProducts(hydrated && order ? order.lines.map((l) => l.productId) : []);

  // Live orders advance through their stages; refresh the clock each minute
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const times = useMemo(() => (order ? stageTimes(order) : []), [order]);

  if (!hydrated) return <div aria-busy className="skeleton h-96" />;
  if (!order) {
    return (
      <EmptyState
        title="Order not found."
        description="It may belong to another account, or the link is incomplete."
        action={<ButtonLink href="/account/orders">Back to orders</ButtonLink>}
      />
    );
  }

  const stage = currentStage(order, now);
  const index = stageIndex(stage);
  const delivered = stage === "delivered";
  const progress = index / (ORDER_STAGES.length - 1);
  const certProduct = certFor ? map[certFor] : null;
  const authenticated = index >= stageIndex("approved");

  return (
    <div>
      <Link href="/account/orders" className="label mb-8 inline-flex items-center gap-2 text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        All orders
      </Link>

      <header className="flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono text-muted">
            Order {order.id} · Placed {formatDate(order.createdAt)}
          </p>
          <h1 className="display-md mt-3">
            {delivered ? (
              <>
                Delivered<em>.</em>
              </>
            ) : (
              <>
                {ORDER_STAGES[index].label}
                <em>.</em>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted">{ORDER_STAGES[index].description}</p>
        </div>
        <div className="sm:text-right">
          <p className="mono text-muted">{delivered ? "Delivered on" : "Expected by"}</p>
          <p className="font-display mt-2 text-3xl">{formatDay(delivered ? times[times.length - 1] : order.estimatedDelivery)}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-14 pt-12 lg:grid-cols-12">
        {/* Timeline */}
        <section aria-label="Tracking" className="lg:col-span-7">
          <ol className="relative">
            <div aria-hidden className="absolute bottom-6 left-[11px] top-3 w-px bg-line">
              <m.div
                className="w-full origin-top bg-fg"
                initial={{ height: 0 }}
                animate={{ height: `${progress * 100}%` }}
                transition={{ duration: 1.4, ease: ease.out, delay: 0.2 }}
              />
            </div>
            {ORDER_STAGES.map((s, i) => {
              const done = i < index || (delivered && i === index);
              const current = i === index && !delivered;
              const time = times[i];
              return (
                <m.li
                  key={s.stage}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.08, duration: 0.6, ease: ease.out } }}
                  className="relative flex gap-6 pb-9 last:pb-0"
                >
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                      done && "border-fg bg-fg text-bg",
                      current && "border-accent bg-bg",
                      !done && !current && "border-line-strong bg-bg",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                    {current ? (
                      <>
                        <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      </>
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <p className={cn("text-sm", done || current ? "text-fg" : "text-subtle")}>{s.label}</p>
                      <p className="mono text-subtle">
                        {done || current ? `${formatDay(time)} · ${formatTime(time)}` : `Expected ${formatDay(time)}`}
                      </p>
                    </div>
                    {done || current ? <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted">{s.description}</p> : null}
                    {s.stage === "authenticating" && current ? (
                      <p className="mono mt-3 inline-flex items-center gap-2 border border-line px-2.5 py-1.5 text-muted">
                        <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                        With a specialist now
                      </p>
                    ) : null}
                  </div>
                </m.li>
              );
            })}
          </ol>
        </section>

        {/* Details */}
        <aside className="flex flex-col gap-10 lg:col-span-5">
          <section aria-label="Pieces">
            <p className="label mb-4 text-muted">Pieces</p>
            <ul className="flex flex-col gap-5">
              {order.lines.map((l) => {
                const p = map[l.productId];
                return (
                  <li key={l.productId + l.size} className="flex gap-4">
                    <Link href={p ? `/product/${p.slug}` : "#"} className="relative h-28 w-[5.5rem] shrink-0 overflow-hidden bg-media">
                      {p ? <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="88px" className="object-cover" /> : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="label">{p ? getBrandName(p.brand) : "…"}</p>
                      <p className="mt-1 truncate text-sm text-muted">{p?.name}</p>
                      <p className="mt-1 text-xs text-subtle">
                        {l.size} · {formatPrice(l.price)}
                      </p>
                      <button
                        type="button"
                        disabled={!authenticated || !p}
                        onClick={() => setCertFor(l.productId)}
                        className="label mt-auto flex w-fit items-center gap-1.5 pt-3 text-fg disabled:text-subtle"
                      >
                        <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {authenticated ? "View certificate" : "Certificate after approval"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="Delivery address" className="border-t border-line pt-8">
            <p className="label mb-3 flex items-center gap-2 text-muted">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
              Delivering to
            </p>
            <p className="text-sm leading-relaxed">
              {order.address.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
            </p>
          </section>

          <section aria-label="Payment" className="border-t border-line pt-8">
            <p className="label mb-5 text-muted">
              Paid by {PAYMENT_METHODS.find((p) => p.value === order.payment)?.label ?? order.payment}
            </p>
            <SummaryLines
              subtotal={order.subtotal}
              protect={order.protectFee}
              shipping={order.shipping}
              gst={order.gst}
              total={order.total}
              shippingLabel={order.delivery === "express" ? "Priority authentication" : "Insured delivery"}
            />
          </section>

          <p className="text-xs text-muted">
            Need help with this order?{" "}
            <Link href="/help#contact" className="text-fg underline underline-offset-2">
              Message client care
            </Link>{" "}
            — quote {order.id}.
          </p>
        </aside>
      </div>

      <Sheet open={!!certProduct} onOpenChange={(o) => !o && setCertFor(null)} side="center" title="Certificate of authenticity" dark>
        {certProduct ? (
          <div className="pb-2">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="mono text-muted">Certificate</p>
                <p className="mono mt-1">{certProduct.authentication.certificateId}</p>
              </div>
              <Seal className="w-20 text-champagne" spin={false} />
            </div>
            <p className="font-display mt-6 text-3xl">{productDisplayName(certProduct)}</p>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted">Order</dt>
              <dd>{order.id}</dd>
              <dt className="text-muted">Verified</dt>
              <dd>{formatDate(times[stageIndex("approved")])}</dd>
              <dt className="text-muted">Specialist</dt>
              <dd>{certProduct.authentication.authenticator ?? "Becho Hub"}</dd>
              <dt className="text-muted">Seal</dt>
              <dd className="mono">BP-{order.id.slice(2)}-{certProduct.id.slice(3)}</dd>
            </dl>
            <ul className="mt-6 flex flex-col gap-2 border-t border-line pt-5">
              {certProduct.authentication.checks.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-xs text-fg/85">
                  <Check className="h-3 w-3 text-[var(--c-seal-bright)]" strokeWidth={2} />
                  {c}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => window.print()} className="label link-undraw mt-8 text-fg">
              Print certificate
            </button>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
