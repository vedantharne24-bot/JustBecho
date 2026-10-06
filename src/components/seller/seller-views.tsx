"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowUpRight, Check, Eye, Heart, Pause, Pencil, Play, Plus, Trash2, Truck } from "lucide-react";
import type { ListingStatus, SellerListing, SellerOrder } from "@/lib/types";
import { useSeller } from "@/store/seller";
import { toast } from "@/store/toast";
import { getBrandName } from "@/lib/data/brands";
import { conditionMap } from "@/lib/conditions";
import { commissionFor } from "@/lib/fees";
import { addBusinessDays, cn } from "@/lib/utils";
import { formatDate, formatDay, formatPrice, formatPriceCompact, relativeTime } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import { ChoiceCard } from "@/components/ui/fields";
import { SalesChart } from "./sales-chart";

const LISTING_STATUS: Record<ListingStatus, { label: string; dot: string }> = {
  active: { label: "Live", dot: "bg-success" },
  pending: { label: "In review", dot: "bg-warning" },
  draft: { label: "Draft", dot: "bg-subtle" },
  sold: { label: "Sold", dot: "bg-fg" },
  paused: { label: "Paused", dot: "border border-line-strong" },
};

const ORDER_STATUS: Record<SellerOrder["status"], { label: string; dot: string }> = {
  "awaiting-dispatch": { label: "Dispatch needed", dot: "bg-accent" },
  "in-transit": { label: "In transit to hub", dot: "bg-warning" },
  authenticating: { label: "Authenticating", dot: "bg-warning" },
  completed: { label: "Completed · paid", dot: "bg-success" },
};

function StatusPill({ label, dot }: { label: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

function Heading({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="display-sm">{title}</h1>
      {action}
    </div>
  );
}

/* Twelve weeks of sales for the demo store; a new store starts flat. */
function weeklySeries(orders: SellerOrder[], demo: boolean) {
  const base = demo ? [96, 142, 61, 210, 118, 174, 88, 265, 132, 196, 289, 0] : Array(12).fill(0);
  const now = Date.now();
  return base.map((v, i) => {
    const weekStart = now - (11 - i) * 7 * 86_400_000;
    const real = orders
      .filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= weekStart - 7 * 86_400_000 && t < weekStart;
      })
      .reduce((n, o) => n + o.amount, 0);
    const date = new Date(weekStart);
    return {
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: v * 1000 + real,
    };
  });
}

/* ── Overview ────────────────────────────────────────────────────────── */

export function SellerOverview() {
  const mode = useSeller((s) => s.mode);
  const listings = useSeller((s) => s.listings);
  const orders = useSeller((s) => s.orders);
  const profile = useSeller((s) => s.profile)!;

  const [now] = useState(() => Date.now());
  const stats = useMemo(() => {
    const month = now - 30 * 86_400_000;
    return {
      sales30: orders.filter((o) => new Date(o.createdAt).getTime() > month).reduce((n, o) => n + o.amount, 0),
      pending: orders.filter((o) => o.status !== "completed").reduce((n, o) => n + o.payout, 0),
      paid: orders.filter((o) => o.status === "completed").reduce((n, o) => n + o.payout, 0),
      live: listings.filter((l) => l.status === "active").length,
      review: listings.filter((l) => l.status === "pending").length,
      views: listings.reduce((n, l) => n + l.views, 0),
    };
  }, [orders, listings, now]);

  const series = useMemo(() => weeklySeries(orders, mode === "demo"), [orders, mode]);
  const awaiting = orders.filter((o) => o.status === "awaiting-dispatch");
  const top = [...listings].filter((l) => l.status === "active").sort((a, b) => b.views - a.views).slice(0, 3);

  return (
    <div className="flex flex-col gap-12">
      <p className="text-sm text-muted">
        Welcome back, {profile.fullName.split(" ")[0]}. {stats.review ? `${stats.review} listing${stats.review > 1 ? "s are" : " is"} in review.` : ""}
      </p>

      {awaiting.length ? (
        <Link
          href="/seller/orders"
          className="group flex items-center justify-between gap-6 border border-accent/40 bg-accent/5 p-5 transition-colors hover:border-accent"
        >
          <span className="flex items-center gap-4">
            <Truck className="h-5 w-5 text-accent" strokeWidth={1.25} />
            <span className="text-sm">
              {awaiting.length} order{awaiting.length > 1 ? "s" : ""} waiting for dispatch — schedule a pickup within 48 hours.
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.25} />
        </Link>
      ) : null}

      <dl className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
        {[
          { label: "Sales · 30 days", value: formatPriceCompact(stats.sales30) },
          { label: "Pending payout", value: formatPriceCompact(stats.pending) },
          { label: "Paid out", value: formatPriceCompact(stats.paid) },
          { label: "Live listings", value: String(stats.live), note: `${stats.views.toLocaleString("en-IN")} views` },
        ].map((s) => (
          <div key={s.label} className="border-b border-r border-line p-5 sm:p-6">
            <dt className="mono text-muted">{s.label}</dt>
            <dd className="price mt-6 text-3xl sm:text-4xl">{s.value}</dd>
            {s.note ? <dd className="mt-1 text-xs text-subtle">{s.note}</dd> : null}
          </div>
        ))}
      </dl>

      <section aria-label="Sales" className="border border-line p-5 sm:p-8">
        {series.some((d) => d.value > 0) ? (
          <SalesChart data={series} />
        ) : (
          <div className="py-12 text-center">
            <p className="font-display text-2xl">Your first sale will appear here.</p>
            <p className="mt-2 text-sm text-muted">Listings typically sell within three weeks.</p>
            <div className="mt-6">
              <ButtonLink href="/seller/new" size="sm">
                Create your first listing
              </ButtonLink>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">
        <section aria-labelledby="recent-orders">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="recent-orders" className="title">
              Recent orders
            </h2>
            <Link href="/seller/orders" className="label link-undraw text-muted">
              All orders
            </Link>
          </div>
          {orders.length ? (
            <ul className="border-t border-line">
              {orders.slice(0, 4).map((o) => (
                <li key={o.id} className="flex items-center gap-4 border-b border-line py-4">
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-media">
                    <Image src={o.image} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{o.listingTitle}</span>
                    <span className="mono mt-1 block text-subtle">
                      {o.id} · {o.buyerCity}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <span className="tabular text-sm">{formatPrice(o.amount)}</span>
                    <StatusPill {...ORDER_STATUS[o.status]} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-line py-8 text-sm text-muted">No orders yet.</p>
          )}
        </section>
        <section aria-labelledby="top-listings">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="top-listings" className="title">
              Most viewed
            </h2>
            <Link href="/seller/listings" className="label link-undraw text-muted">
              All listings
            </Link>
          </div>
          {top.length ? (
            <ul className="border-t border-line">
              {top.map((l) => (
                <li key={l.id} className="flex items-center gap-4 border-b border-line py-4">
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-media">
                    <Image src={l.image} alt="" fill sizes="44px" className="object-cover" unoptimized={l.image.startsWith("data:")} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label block">{getBrandName(l.brand)}</span>
                    <span className="mt-1 block truncate text-sm text-muted">{l.title}</span>
                  </span>
                  <span className="mono flex items-center gap-4 text-muted">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" strokeWidth={1.5} /> {l.views.toLocaleString("en-IN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" strokeWidth={1.5} /> {l.saves}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-line py-8 text-sm text-muted">Live listings will show their views and saves here.</p>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Listings ────────────────────────────────────────────────────────── */

export function SellerListings() {
  const listings = useSeller((s) => s.listings);
  const setStatus = useSeller((s) => s.setListingStatus);
  const setPrice = useSeller((s) => s.setListingPrice);
  const remove = useSeller((s) => s.removeListing);
  const [tab, setTab] = useState<"all" | ListingStatus>("all");
  const [editing, setEditing] = useState<SellerListing | null>(null);
  const [price, setPriceInput] = useState("");
  const [deleting, setDeleting] = useState<SellerListing | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: listings.length };
    for (const l of listings) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [listings]);
  const shown = tab === "all" ? listings : listings.filter((l) => l.status === tab);
  const priceNumber = Number(price.replace(/\D/g, ""));

  return (
    <div>
      <Heading
        title={<>Listings</>}
        action={
          <ButtonLink href="/seller/new" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" strokeWidth={1.5} />}>
            New listing
          </ButtonLink>
        }
      />
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter listings">
        {(["all", "active", "pending", "draft", "paused", "sold"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-colors",
              tab === t ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
            )}
          >
            {t === "all" ? "All" : LISTING_STATUS[t].label}
            <span className="tabular opacity-60">{counts[t] ?? 0}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={listings.length ? "Nothing in this view." : "No listings yet."}
          description={listings.length ? "Try another filter." : "List your first piece — it takes about five minutes."}
          action={!listings.length ? <ButtonLink href="/seller/new">Create a listing</ButtonLink> : undefined}
        />
      ) : (
        <ul className="border-t border-line">
          <AnimatePresence initial={false}>
            {shown.map((l) => {
              return (
                <m.li
                  key={l.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.3 } }}
                  exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                  className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-b border-line py-5 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-6"
                >
                  <span className="relative row-span-2 h-20 w-16 overflow-hidden bg-media sm:row-span-1">
                    <Image src={l.image} alt="" fill sizes="64px" className="object-cover" unoptimized={l.image.startsWith("data:")} />
                  </span>
                  <span className="min-w-0">
                    <span className="label block">{getBrandName(l.brand)}</span>
                    <span className="mt-1 block truncate text-sm">
                      {l.productSlug && l.status === "active" ? (
                        <Link href={`/product/${l.productSlug}`} className="hover:underline">
                          {l.title}
                        </Link>
                      ) : (
                        l.title
                      )}
                    </span>
                    <span className="mono mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-subtle">
                      <span>{conditionMap[l.condition].short}</span>
                      <span>{l.size}</span>
                      <span>Listed {relativeTime(l.createdAt)}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-1.5">
                    <span className="tabular text-sm">{formatPrice(l.price)}</span>
                    <StatusPill {...LISTING_STATUS[l.status]} />
                  </span>
                  <span className="col-span-2 flex items-center gap-1 sm:col-span-1">
                    {l.status !== "sold" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(l);
                          setPriceInput(l.price.toLocaleString("en-IN"));
                        }}
                        aria-label={`Edit price of ${l.title}`}
                        className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-hover hover:text-fg"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    ) : null}
                    {l.status === "active" || l.status === "paused" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setStatus(l.id, l.status === "active" ? "paused" : "active");
                          toast({ title: l.status === "active" ? "Listing paused" : "Listing is live again", description: l.title });
                        }}
                        aria-label={l.status === "active" ? `Pause ${l.title}` : `Reactivate ${l.title}`}
                        className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-hover hover:text-fg"
                      >
                        {l.status === "active" ? <Pause className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Play className="h-3.5 w-3.5" strokeWidth={1.5} />}
                      </button>
                    ) : null}
                    {l.status === "draft" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setStatus(l.id, "pending");
                          toast({ title: "Submitted for review", description: "We’ll review it within 24 hours." });
                        }}
                        className="label px-2 text-muted hover:text-fg"
                      >
                        Submit
                      </button>
                    ) : null}
                    {l.status !== "sold" ? (
                      <button
                        type="button"
                        onClick={() => setDeleting(l)}
                        aria-label={`Delete ${l.title}`}
                        className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-hover hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    ) : null}
                  </span>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} side="center" title="Update price" description={editing?.title}>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (priceNumber < 1000) return;
              setPrice(editing.id, priceNumber);
              toast({ title: "Price updated", description: `${editing.title} · ${formatPrice(priceNumber)}`, tone: "success" });
              setEditing(null);
            }}
          >
            <label htmlFor="edit-price" className="label text-muted">
              New price
            </label>
            <div className="mt-2 flex items-baseline gap-2 border-b border-line-strong focus-within:border-fg">
              <span className="price text-3xl text-muted">₹</span>
              <input
                id="edit-price"
                inputMode="numeric"
                autoFocus
                value={price}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "");
                  setPriceInput(d ? Number(d).toLocaleString("en-IN") : "");
                }}
                className="price min-w-0 flex-1 bg-transparent py-2 text-4xl focus:outline-none"
              />
            </div>
            {priceNumber >= 1000 ? (
              <p className="mt-3 text-xs text-muted">
                You’ll receive {formatPrice(commissionFor(priceNumber).payout)} after {Math.round(commissionFor(priceNumber).rate * 100)}% commission.
                {priceNumber < editing.price ? " Followers of this piece will get a price-drop alert." : ""}
              </p>
            ) : (
              <p className="mt-3 text-xs text-error">Minimum price is ₹1,000.</p>
            )}
            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={priceNumber < 1000}>
                Save price
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} side="center" title="Delete this listing?">
        <p className="text-sm text-muted">“{deleting?.title}” will be removed from JustBecho. Buyers who saved it will no longer see it.</p>
        <div className="mt-8 flex gap-3">
          <Button
            variant="accent"
            onClick={() => {
              if (deleting) remove(deleting.id);
              toast({ title: "Listing deleted" });
              setDeleting(null);
            }}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Keep it
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/* ── Orders ──────────────────────────────────────────────────────────── */

export function SellerOrders() {
  const orders = useSeller((s) => s.orders);
  const markDispatched = useSeller((s) => s.markDispatched);
  const [dispatching, setDispatching] = useState<SellerOrder | null>(null);
  const [slot, setSlot] = useState("0");
  const slots = useMemo(() => [1, 2, 3].map((d) => addBusinessDays(new Date(), d)), []);

  return (
    <div>
      <Heading title={<>Orders</>} />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet." description="When a piece sells, you’ll schedule a free insured pickup from here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Seller orders</caption>
            <thead>
              <tr className="border-b border-line-strong">
                {["Piece", "Order", "Sale", "Your payout", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="label pb-3 pr-4 font-medium text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="py-4 pr-4">
                    <span className="flex items-center gap-3">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-media">
                        <Image src={o.image} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="label block">{getBrandName(o.brand)}</span>
                        <span className="mt-0.5 block max-w-[14rem] truncate text-muted">{o.listingTitle}</span>
                      </span>
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="mono block">{o.id}</span>
                    <span className="mt-1 block text-xs text-subtle">
                      {formatDate(o.createdAt, { year: undefined })} · {o.buyerCity}
                    </span>
                  </td>
                  <td className="tabular py-4 pr-4">{formatPrice(o.amount)}</td>
                  <td className="tabular py-4 pr-4">{formatPrice(o.payout)}</td>
                  <td className="py-4 pr-4">
                    <StatusPill {...ORDER_STATUS[o.status]} />
                  </td>
                  <td className="py-4 text-right">
                    {o.status === "awaiting-dispatch" ? (
                      <Button size="sm" onClick={() => setDispatching(o)}>
                        Schedule pickup
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!dispatching} onOpenChange={(o) => !o && setDispatching(null)} side="center" title="Schedule a pickup" description={dispatching ? `${dispatching.listingTitle} · ${dispatching.id}` : undefined}>
        <p className="text-sm text-muted">Our courier collects from your pickup address and brings it, insured, to the Becho Hub. Please pack the piece on camera.</p>
        <div className="mt-6 flex flex-col gap-3">
          {slots.map((d, i) => (
            <ChoiceCard
              key={d.toISOString()}
              name="slot"
              value={String(i)}
              checked={slot === String(i)}
              onChange={setSlot}
              title={formatDay(d)}
              description="Between 10 am and 6 pm"
            />
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <Button
            iconLeft={<Check className="h-4 w-4" strokeWidth={1.5} />}
            onClick={() => {
              if (dispatching) markDispatched(dispatching.id);
              toast({ title: "Pickup scheduled", description: `${formatDay(slots[Number(slot)])}, 10 am – 6 pm`, tone: "success" });
              setDispatching(null);
            }}
          >
            Confirm pickup
          </Button>
          <Button variant="outline" onClick={() => setDispatching(null)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/* ── Earnings ────────────────────────────────────────────────────────── */

export function SellerEarnings() {
  const orders = useSeller((s) => s.orders);
  const profile = useSeller((s) => s.profile)!;
  const completed = orders.filter((o) => o.status === "completed");
  const pending = orders.filter((o) => o.status !== "completed");
  const paid = completed.reduce((n, o) => n + o.payout, 0);
  const upcoming = pending.reduce((n, o) => n + o.payout, 0);
  const fees = orders.reduce((n, o) => n + (o.amount - o.payout), 0);

  return (
    <div className="flex flex-col gap-12">
      <Heading title={<>Earnings</>} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="theme-dark p-6 sm:p-8">
          <p className="mono text-muted">On its way to you</p>
          <p className="price mt-6 text-4xl">{formatPrice(upcoming)}</p>
          <p className="mt-2 text-xs text-muted">Released 48 hours after each delivery</p>
        </div>
        <div className="border border-line p-6 sm:p-8">
          <p className="mono text-muted">Paid out</p>
          <p className="price mt-6 text-4xl">{formatPrice(paid)}</p>
          <p className="mt-2 text-xs text-muted">To {profile.upi}</p>
        </div>
        <div className="border border-line p-6 sm:p-8">
          <p className="mono text-muted">Commission paid</p>
          <p className="price mt-6 text-4xl">{formatPrice(fees)}</p>
          <p className="mt-2 text-xs text-muted">Includes authentication & shipping</p>
        </div>
      </div>

      <section aria-labelledby="payouts-title">
        <h2 id="payouts-title" className="title mb-4">
          Payout history
        </h2>
        {completed.length ? (
          <ul className="border-t border-line">
            {completed.map((o) => {
              const date = new Date(new Date(o.createdAt).getTime() + 7 * 86_400_000);
              return (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4 text-sm">
                  <span>
                    <span className="block">{o.listingTitle}</span>
                    <span className="mono mt-1 block text-subtle">
                      UPI · {formatDate(date)} · REF {o.id.replace("SO-", "PO")}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="tabular">{formatPrice(o.payout)}</span>
                    <StatusPill label="Paid" dot="bg-success" />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="border-t border-line py-8 text-sm text-muted">Your payouts will be listed here with UPI references.</p>
        )}
      </section>
    </div>
  );
}
