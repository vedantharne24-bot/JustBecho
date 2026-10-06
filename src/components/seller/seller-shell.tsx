"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight, BarChart3, IndianRupee, LayoutGrid, LogOut, Package, Plus } from "lucide-react";
import { useSeller } from "@/store/seller";
import { useHydrated } from "@/hooks/use-hydrated";
import { editorial } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/misc";

const NAV = [
  { href: "/seller", label: "Overview", icon: BarChart3 },
  { href: "/seller/listings", label: "Listings", icon: LayoutGrid },
  { href: "/seller/orders", label: "Orders", icon: Package },
  { href: "/seller/earnings", label: "Earnings", icon: IndianRupee },
];

export function SellerShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const mode = useSeller((s) => s.mode);
  const profile = useSeller((s) => s.profile);
  const orders = useSeller((s) => s.orders);
  const startDemo = useSeller((s) => s.startDemo);
  const signOut = useSeller((s) => s.signOut);
  const awaiting = orders.filter((o) => o.status === "awaiting-dispatch").length;

  if (!hydrated) {
    return (
      <div className="container-x pt-[calc(var(--header-h)+3rem)] pb-24" aria-busy>
        <div className="skeleton h-10 w-1/3" />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (mode === "none" || !profile) {
    return (
      <section className="theme-dark min-h-[100svh]">
        <div className="container-x grid grid-cols-1 min-h-[100svh] items-center gap-14 pb-16 pt-[calc(var(--header-h)+3rem)] lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Eyebrow>Seller centre</Eyebrow>
            <h1 className="display-lg mt-6">
              Your store, <em>managed.</em>
            </h1>
            <p className="lede mt-6 max-w-md text-muted">
              Listings, orders, authentication status and payouts in one place. Open a store in two minutes — or look around
              a working boutique first.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/sell/register" variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
                Open your store
              </ButtonLink>
              <Button variant="outline" onClick={startDemo}>
                Preview a demo store
              </Button>
            </div>
            <p className="mt-6 text-xs text-subtle">The demo loads The Archive Bombay’s listings and orders into this browser only.</p>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden lg:col-span-5 lg:col-start-8 lg:block">
            <Image src={editorial.closet.src} alt={editorial.closet.alt} fill sizes="40vw" className="object-cover" />
          </div>
        </div>
      </section>
    );
  }

  const isActive = (href: string) => (href === "/seller" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="container-x pb-28 pt-[calc(var(--header-h)+2rem)] sm:pt-[calc(var(--header-h)+3rem)]">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="mono flex items-center gap-3 text-muted">
            Seller centre
            {mode === "demo" ? <span className="rounded-full border border-line px-2 py-0.5 text-[10px]">Demo store</span> : null}
          </p>
          <p className="display-sm mt-3">{profile.storeName}</p>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/seller/new" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" strokeWidth={1.5} />}>
            New listing
          </ButtonLink>
          <Button size="sm" variant="outline" onClick={signOut} iconLeft={<LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />}>
            {mode === "demo" ? "Exit demo" : "Sign out"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <nav aria-label="Seller" className="lg:col-span-2">
          <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-1 overflow-x-auto px-[var(--gutter)] lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:mx-0 lg:flex-col lg:px-0">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition-colors lg:rounded-none lg:border-0 lg:border-l lg:px-4 lg:py-2.5",
                      active ? "border-fg bg-fg text-bg lg:bg-transparent lg:text-fg" : "border-line text-muted hover:text-fg lg:border-line",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.25} />
                    {label}
                    {href === "/seller/orders" && awaiting ? (
                      <span className="tabular ml-auto rounded-full bg-seal px-1.5 text-[10px] text-paper">{awaiting}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0 lg:col-span-10">{children}</div>
      </div>
    </div>
  );
}
