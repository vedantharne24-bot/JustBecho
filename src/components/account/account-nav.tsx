"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { selectUnread, useAccount } from "@/store/account";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/requests", label: "Requests" },
  { href: "/account/recently-viewed", label: "Recently viewed" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const unread = useAccount(selectUnread);
  const orders = useAccount((s) => s.orders.length);
  const saved = useWishlist((s) => s.ids.length);
  const profile = useAccount((s) => s.profile);

  const count = (href: string) => {
    if (!hydrated) return null;
    if (href === "/account/notifications") return unread || null;
    if (href === "/account/orders") return orders || null;
    if (href === "/account/wishlist") return saved || null;
    return null;
  };

  const isActive = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="Account">
      <div className="mb-8 hidden items-center gap-4 lg:flex">
        <span className="font-display grid h-14 w-14 place-items-center rounded-full bg-invert text-xl italic text-invert-fg">
          {hydrated ? `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}` : ""}
        </span>
        <div>
          <p className="text-sm">{hydrated ? `${profile.firstName} ${profile.lastName}` : " "}</p>
          <p className="mono mt-1 text-muted">Collector · Mumbai</p>
        </div>
      </div>
      <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-1 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-line lg:px-0">
        {LINKS.map((l) => {
          const active = isActive(l.href);
          const n = count(l.href);
          return (
            <li key={l.href} className="shrink-0 lg:border-b lg:border-line">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-6 rounded-full border px-4 py-2 text-sm transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-3.5",
                  active ? "border-fg bg-fg text-bg lg:bg-transparent lg:text-fg" : "border-line text-muted hover:text-fg",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn("hidden h-px bg-fg transition-[width] duration-500 ease-out lg:block", active ? "w-5" : "w-0")}
                  />
                  {l.label}
                </span>
                {n ? (
                  <span
                    className={cn(
                      "mono tabular",
                      l.href === "/account/notifications" ? "rounded-full bg-seal px-1.5 text-[10px] text-paper" : "text-subtle",
                    )}
                  >
                    {n}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
