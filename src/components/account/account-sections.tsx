"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Bell, Eye, MapPin, Package, Pencil, Plus, Tag, Trash2, Heart, UserRound, Newspaper } from "lucide-react";
import type { Address, Notification } from "@/lib/types";
import { useAccount } from "@/store/account";
import { useHistory } from "@/store/history";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useSeller } from "@/store/seller";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProducts } from "@/hooks/use-products";
import { currentStage } from "@/lib/orders";
import { relativeTime } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toast";
import { ProductCard } from "@/components/product/product-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Switch } from "@/components/ui/fields";
import { Sheet } from "@/components/ui/sheet";
import { AddressForm } from "./address-form";
import { OrderCard } from "./order-card";

export function SectionTitle({ title, eyebrow, action }: { title: React.ReactNode; eyebrow?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        {eyebrow ? <p className="mono text-muted">{eyebrow}</p> : null}
        <h1 className="display-md mt-3">{title}</h1>
      </div>
      {action}
    </header>
  );
}

const Loading = () => (
  <div aria-busy className="flex flex-col gap-3">
    <div className="skeleton h-32" />
    <div className="skeleton h-32" />
  </div>
);

/* ── Orders ──────────────────────────────────────────────────────────── */

export function OrdersList() {
  const hydrated = useHydrated();
  const orders = useAccount((s) => s.orders);
  const [tab, setTab] = useState<"all" | "active" | "delivered">("all");
  const ids = useMemo(() => [...new Set(orders.flatMap((o) => o.lines.map((l) => l.productId)))], [orders]);
  const { map } = useProducts(hydrated ? ids : []);

  const filtered = orders.filter((o) => {
    const delivered = currentStage(o) === "delivered";
    return tab === "all" || (tab === "delivered" ? delivered : !delivered);
  });

  return (
    <div>
      <SectionTitle eyebrow="Purchases" title={<>Your <em>orders.</em></>} />
      <div role="tablist" aria-label="Filter orders" className="mb-8 flex gap-2">
        {(["all", "active", "delivered"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              tab === t ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
            )}
          >
            {t === "active" ? "In progress" : t}
          </button>
        ))}
      </div>
      {!hydrated ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" strokeWidth={1} />}
          title={tab === "all" ? "No orders yet." : "Nothing here."}
          description="When you buy a piece, you’ll follow it here from the seller, through authentication, to your door."
          action={<ButtonLink href="/explore">Start exploring</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} products={map} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Addresses ───────────────────────────────────────────────────────── */

export function AddressBook() {
  const hydrated = useHydrated();
  const addresses = useAccount((s) => s.addresses);
  const save = useAccount((s) => s.saveAddress);
  const remove = useAccount((s) => s.removeAddress);
  const setDefault = useAccount((s) => s.setDefaultAddress);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [confirm, setConfirm] = useState<Address | null>(null);

  return (
    <div>
      <SectionTitle
        eyebrow="Delivery"
        title={<>Your <em>addresses.</em></>}
        action={
          <Button size="sm" variant="outline" iconLeft={<Plus className="h-3.5 w-3.5" strokeWidth={1.5} />} onClick={() => setEditing("new")}>
            Add address
          </Button>
        }
      />
      {!hydrated ? (
        <Loading />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" strokeWidth={1} />}
          title="No saved addresses."
          description="Save an address for one-tap checkout."
          action={<Button onClick={() => setEditing("new")}>Add an address</Button>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {addresses.map((a) => (
              <m.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.out } }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                className={cn("flex flex-col border p-6", a.isDefault ? "border-fg" : "border-line")}
              >
                <div className="flex items-center justify-between">
                  <p className="label">{a.label}</p>
                  {a.isDefault ? <span className="mono text-muted">Default</span> : null}
                </div>
                <p className="mt-4 text-sm leading-relaxed">
                  {a.name}
                  <br />
                  {a.line1}
                  {a.line2 ? (
                    <>
                      <br />
                      {a.line2}
                    </>
                  ) : null}
                  <br />
                  {a.city}, {a.state} {a.pincode}
                </p>
                <p className="mt-2 text-xs text-muted">{a.phone}</p>
                <div className="mt-6 flex flex-wrap gap-5 border-t border-line pt-4">
                  <button type="button" onClick={() => setEditing(a)} className="label flex items-center gap-1.5 text-muted hover:text-fg">
                    <Pencil className="h-3 w-3" strokeWidth={1.5} /> Edit
                  </button>
                  {!a.isDefault ? (
                    <button type="button" onClick={() => setDefault(a.id)} className="label text-muted hover:text-fg">
                      Set as default
                    </button>
                  ) : null}
                  <button type="button" onClick={() => setConfirm(a)} className="label ml-auto flex items-center gap-1.5 text-muted hover:text-error">
                    <Trash2 className="h-3 w-3" strokeWidth={1.5} /> Remove
                  </button>
                </div>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Sheet
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        side="right"
        title={editing === "new" ? "New address" : "Edit address"}
      >
        {editing !== null ? (
          <AddressForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? { isDefault: addresses.length === 0 } : editing}
            onCancel={() => setEditing(null)}
            onSubmit={(values) => {
              save({ ...values, id: editing === "new" ? undefined : editing.id });
              setEditing(null);
              toast({ title: editing === "new" ? "Address added" : "Address updated", tone: "success" });
            }}
          />
        ) : null}
      </Sheet>

      <Sheet open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} side="center" title="Remove this address?">
        <p className="text-sm text-muted">
          {confirm?.label} — {confirm?.line1}, {confirm?.city}. Orders already placed won’t be affected.
        </p>
        <div className="mt-8 flex gap-3">
          <Button
            variant="accent"
            onClick={() => {
              if (confirm) remove(confirm.id);
              setConfirm(null);
              toast({ title: "Address removed" });
            }}
          >
            Remove
          </Button>
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Keep it
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/* ── Recently viewed ─────────────────────────────────────────────────── */

export function ViewedGrid() {
  const hydrated = useHydrated();
  const viewed = useHistory((s) => s.viewed);
  const clear = useHistory((s) => s.clearViewed);
  const { products, loading } = useProducts(hydrated ? viewed : []);

  return (
    <div>
      <SectionTitle
        eyebrow="History"
        title={<>Recently <em>viewed.</em></>}
        action={
          viewed.length ? (
            <button type="button" onClick={clear} className="label link-undraw text-muted">
              Clear history
            </button>
          ) : null
        }
      />
      {!hydrated || (loading && viewed.length) ? (
        <Loading />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Eye className="h-8 w-8" strokeWidth={1} />}
          title="Nothing viewed yet."
          description="Pieces you look at appear here, so you can find your way back."
          action={<ButtonLink href="/explore">Explore</ButtonLink>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────────────────── */

const KIND_ICON: Record<Notification["kind"], typeof Bell> = {
  order: Package,
  price: Tag,
  wishlist: Heart,
  account: UserRound,
  editorial: Newspaper,
};

export function NotificationsList() {
  const hydrated = useHydrated();
  const notifications = useAccount((s) => s.notifications);
  const markRead = useAccount((s) => s.markRead);
  const markAllRead = useAccount((s) => s.markAllRead);
  const remove = useAccount((s) => s.removeNotification);
  const [filter, setFilter] = useState<"all" | "unread" | Notification["kind"]>("all");

  const list = notifications.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.kind === filter));
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <SectionTitle
        eyebrow={unread ? `${unread} unread` : "All caught up"}
        title={<>Notifi<em>cations.</em></>}
        action={
          unread ? (
            <button type="button" onClick={markAllRead} className="label link-undraw text-muted">
              Mark all as read
            </button>
          ) : null
        }
      />
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter notifications">
        {(["all", "unread", "order", "price", "wishlist", "editorial"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              filter === f ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
            )}
          >
            {f === "price" ? "Price drops" : f === "editorial" ? "From us" : f}
          </button>
        ))}
      </div>
      {!hydrated ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState icon={<Bell className="h-8 w-8" strokeWidth={1} />} title="Nothing new." description="Order updates, price drops on saved pieces and Vault openings will appear here." />
      ) : (
        <ul className="border-t border-line">
          <AnimatePresence initial={false}>
            {list.map((n) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <m.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
                  className="group relative flex gap-5 border-b border-line py-6"
                >
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border", n.read ? "border-line text-subtle" : "border-fg text-fg")}>
                    <Icon className="h-4 w-4" strokeWidth={1.25} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className={cn("text-sm", n.read ? "text-muted" : "text-fg")}>
                        {!n.read ? <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" aria-label="Unread" /> : null}
                        {n.title}
                      </p>
                      <p className="mono shrink-0 text-subtle">{relativeTime(n.createdAt)}</p>
                    </div>
                    <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted">{n.body}</p>
                    <div className="mt-3 flex gap-5">
                      {n.href ? (
                        <Link href={n.href} onClick={() => markRead(n.id)} className="label link-undraw">
                          View
                        </Link>
                      ) : null}
                      {!n.read ? (
                        <button type="button" onClick={() => markRead(n.id)} className="label text-muted hover:text-fg">
                          Mark as read
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => remove(n.id)}
                        aria-label={`Delete notification: ${n.title}`}
                        className="label ml-auto text-subtle opacity-100 transition-opacity hover:text-error sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

/* ── Settings ────────────────────────────────────────────────────────── */

export function SettingsPanel() {
  const hydrated = useHydrated();
  const settings = useAccount((s) => s.settings);
  const update = useAccount((s) => s.updateSettings);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (patch: Partial<typeof settings>) => {
    update(patch);
    toast({ title: "Preferences saved" });
  };

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      account: useAccount.getState(),
      wishlist: useWishlist.getState().ids,
      bag: useCart.getState().lines,
      history: useHistory.getState(),
      seller: useSeller.getState(),
    };
    const blob = new Blob([JSON.stringify(data, (k, v) => (typeof v === "function" ? undefined : v), 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "justbecho-account-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    ["jb-cart", "jb-wishlist", "jb-history", "jb-account", "jb-seller"].forEach((k) => localStorage.removeItem(k));
    // Full reload so every in-memory store starts from its seed again
    window.location.replace(window.location.origin);
  };

  if (!hydrated) return <Loading />;

  return (
    <div>
      <SectionTitle eyebrow="Preferences" title={<>Settings<em>.</em></>} />
      <div className="grid gap-14">
        <section aria-labelledby="s-comm">
          <h2 id="s-comm" className="label mb-2 text-muted">
            How we reach you
          </h2>
          <div className="divide-y divide-line border-y border-line">
            <Switch checked={settings.emailUpdates} onChange={(v) => set({ emailUpdates: v })} label="Email" description="Order updates and receipts." />
            <Switch checked={settings.whatsappUpdates} onChange={(v) => set({ whatsappUpdates: v })} label="WhatsApp" description="Authentication milestones and delivery OTP." />
            <Switch checked={settings.smsUpdates} onChange={(v) => set({ smsUpdates: v })} label="SMS" description="Delivery alerts only." />
          </div>
        </section>
        <section aria-labelledby="s-alerts">
          <h2 id="s-alerts" className="label mb-2 text-muted">
            Alerts
          </h2>
          <div className="divide-y divide-line border-y border-line">
            <Switch checked={settings.priceDrops} onChange={(v) => set({ priceDrops: v })} label="Price drops" description="When a saved piece is reduced." />
            <Switch checked={settings.wishlistAlerts} onChange={(v) => set({ wishlistAlerts: v })} label="Wishlist activity" description="When a saved piece is reserved or nearly gone." />
            <Switch checked={settings.newArrivals} onChange={(v) => set({ newArrivals: v })} label="The Becho Letter" description="Friday’s new arrivals from the Vault." />
          </div>
        </section>
        <section aria-labelledby="s-privacy">
          <h2 id="s-privacy" className="label mb-2 text-muted">
            Privacy & data
          </h2>
          <div className="divide-y divide-line border-y border-line">
            <Switch checked={settings.privateProfile} onChange={(v) => set({ privateProfile: v })} label="Private collector profile" description="Hide your name from sellers until an order is confirmed." />
            <div className="flex items-center justify-between gap-6 py-4">
              <div>
                <p className="text-sm">Download your data</p>
                <p className="mt-0.5 text-xs text-muted">Profile, orders, addresses and preferences as JSON.</p>
              </div>
              <Button size="sm" variant="outline" onClick={exportData}>
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
              <div>
                <p className="text-sm">Reset this preview</p>
                <p className="mt-0.5 text-xs text-muted">Clears your bag, wishlist, orders and seller data stored in this browser.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setConfirmReset(true)}>
                Reset
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Sheet open={confirmReset} onOpenChange={setConfirmReset} side="center" title="Reset everything?">
        <p className="text-sm text-muted">This removes all locally stored data and returns you to the homepage. It can’t be undone.</p>
        <div className="mt-8 flex gap-3">
          <Button variant="accent" onClick={reset}>
            Reset preview
          </Button>
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}


/* ── Concierge requests ──────────────────────────────────────────────── */

const REQUEST_KIND = { sourcing: "Sourcing", question: "Question", viewing: "Private viewing" } as const;
const REQUEST_STATUS = {
  received: { label: "Received", dot: "bg-warning" },
  "in-progress": { label: "Specialist assigned", dot: "bg-accent" },
  confirmed: { label: "Confirmed", dot: "bg-success" },
} as const;

export function RequestsList() {
  const hydrated = useHydrated();
  const requests = useAccount((s) => s.requests);
  return (
    <div>
      <SectionTitle
        eyebrow="Concierge"
        title={<>Your <em>requests.</em></>}
        action={<ButtonLink href="/concierge" size="sm" variant="outline">Request a piece</ButtonLink>}
      />
      {!hydrated ? (
        <Loading />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests yet."
          description="Ask a specialist about a piece, book a private viewing, or have us find something specific."
          action={<ButtonLink href="/concierge">Visit the concierge</ButtonLink>}
        />
      ) : (
        <ul className="border-t border-line">
          {requests.map((r) => (
            <li key={r.id} className="grid grid-cols-1 gap-3 border-b border-line py-6 sm:grid-cols-[10rem_1fr_auto] sm:gap-8">
              <div>
                <p className="mono text-muted">{REQUEST_KIND[r.kind]}</p>
                <p className="mono mt-1 text-subtle">{relativeTime(r.createdAt)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm">
                  {r.productSlug ? (
                    <Link href={`/product/${r.productSlug}`} className="hover:underline">
                      {r.title}
                    </Link>
                  ) : (
                    r.title
                  )}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{r.detail}</p>
              </div>
              <span className="inline-flex items-center gap-2 self-start text-xs">
                <span className={cn("h-1.5 w-1.5 rounded-full", REQUEST_STATUS[r.status].dot)} aria-hidden />
                {REQUEST_STATUS[r.status].label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
