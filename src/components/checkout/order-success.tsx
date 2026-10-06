"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { m } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useAccount } from "@/store/account";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProducts } from "@/hooks/use-products";
import { formatDay, formatPrice } from "@/lib/format";
import { getBrandName } from "@/lib/data/brands";
import { ORDER_STAGES } from "@/lib/orders";
import { ease } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/button";
import { Seal } from "@/components/ui/seal";
import { EmptyState } from "@/components/ui/misc";

export function OrderSuccess() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const id = params.get("order");
  const order = useAccount((s) => s.orders.find((o) => o.id === id));
  const firstName = useAccount((s) => s.profile.firstName);
  const { map } = useProducts(hydrated && order ? order.lines.map((l) => l.productId) : []);

  if (!hydrated) {
    return <div className="theme-dark min-h-[80svh]" aria-busy />;
  }

  if (!order) {
    return (
      <div className="container-x pt-[var(--header-h)]">
        <EmptyState
          title="We couldn’t find that order."
          description="If you’ve just placed it, it’s safe — find every order in your account."
          action={<ButtonLink href="/account/orders">View your orders</ButtonLink>}
        />
      </div>
    );
  }

  const end = new Date(order.estimatedDelivery);
  const start = new Date(end);
  start.setDate(end.getDate() - 2);

  return (
    <section className="theme-dark grain relative overflow-hidden pb-24 pt-[calc(var(--header-h)+4rem)] sm:pb-32">
      <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <m.div
            initial={{ scale: 1.8, rotate: -24, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 1.3, 0.4, 1], delay: 0.15 }}
            className="w-28 text-[var(--c-seal-bright)] sm:w-36"
          >
            <Seal className="w-full" text="Order confirmed · Becho Protect · Sealed for you · " />
          </m.div>

          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8, ease: ease.out } }}
            className="mono mt-10 text-muted"
          >
            Order {order.id} · Confirmed
          </m.p>
          <m.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 1, ease: ease.out } }}
            className="display-lg mt-4"
          >
            Thank you, <em>{firstName}.</em>
          </m.h1>
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.9, duration: 0.8 } }}
            className="lede mt-6 max-w-lg text-muted"
          >
            We’ve asked the seller to send your piece to the Becho Hub. You’ll see every checkpoint — received,
            authenticated, sealed — as it happens.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.05, duration: 0.8, ease: ease.out } }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <ButtonLink href={`/account/orders/${order.id}`} variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
              Track your order
            </ButtonLink>
            <ButtonLink href="/explore" variant="outline">
              Continue shopping
            </ButtonLink>
          </m.div>
        </div>

        <m.aside
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 1, ease: ease.out } }}
          className="border border-line p-6 sm:p-8 lg:col-span-5"
        >
          <p className="mono text-muted">Arriving</p>
          <p className="font-display mt-3 text-4xl">
            {formatDay(start)} – {formatDay(end)}
          </p>
          <p className="mt-2 text-sm text-muted">
            To {order.address.name}, {order.address.city} {order.address.pincode}
          </p>

          <ul className="mt-8 flex flex-col gap-4 border-t border-line pt-6">
            {order.lines.map((l) => {
              const p = map[l.productId];
              return (
                <li key={l.productId + l.size} className="flex items-center gap-4">
                  <span className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden bg-media">
                    {p ? <Image src={p.images[0].src} alt="" fill sizes="56px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label block truncate">{p ? getBrandName(p.brand) : "…"}</span>
                    <span className="mt-1 block truncate text-xs text-muted">
                      {p?.name} · {l.size}
                    </span>
                  </span>
                  <span className="tabular text-sm">{formatPrice(l.price * l.quantity)}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
            <span className="label">Paid</span>
            <span className="price text-2xl">{formatPrice(order.total)}</span>
          </div>

          <ol className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
            {ORDER_STAGES.slice(0, 4).map((s, i) => (
              <li key={s.stage} className="flex items-center gap-3 text-xs">
                <span className={i === 0 ? "h-2 w-2 rounded-full bg-[var(--c-seal-bright)]" : "h-2 w-2 rounded-full border border-line-strong"} />
                <span className={i === 0 ? "text-fg" : "text-muted"}>{s.label}</span>
              </li>
            ))}
          </ol>
        </m.aside>
      </div>
    </section>
  );
}
