"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav";
import { useUI } from "@/store/ui";
import { selectCartCount, useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { MegaMenu, type MegaMenuData } from "./mega-menu";

/** Routes that open on a dark, full-bleed hero — the header starts transparent there. */
const DARK_HERO = ["/", "/protect", "/sell", "/checkout/success", "/concierge"];
const DARK_HERO_PREFIX = ["/edits/"];

export function Header({ menu }: { menu: MegaMenuData }) {
  const pathname = usePathname();
  const overlayOpen = useUI((s) => s.overlay);
  const open = useUI((s) => s.open);
  const hydrated = useHydrated();
  const cartCount = useCart(selectCartCount);
  const wishCount = useWishlist((s) => s.ids.length);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"explore" | "brands" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const darkHero = DARK_HERO.includes(pathname) || DARK_HERO_PREFIX.some((p) => pathname.startsWith(p));
  const transparent = darkHero && !scrolled && !activeMenu;

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Let sticky toolbars know whether the header is covering the top edge
  useEffect(() => {
    document.documentElement.dataset.header = hidden && !activeMenu ? "hidden" : "shown";
  }, [hidden, activeMenu]);

  // Close menus on navigation (adjusting state during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setActiveMenu(null);
    setHidden(false);
  }

  // ⌘K / Ctrl+K opens search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open("search");
      }
      if (e.key === "Escape") setActiveMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const scheduleOpen = (menuKey: "explore" | "brands") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setActiveMenu(menuKey), activeMenu ? 0 : 90);
  };
  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 160);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a
        href="#main"
        className="label fixed left-4 top-3 z-[100] -translate-y-20 bg-ink px-4 py-3 text-ivory transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        style={{ viewTransitionName: "site-header" }}
        onPointerLeave={scheduleClose}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,border-color] duration-500 ease-out",
          hidden && !activeMenu && !overlayOpen ? "-translate-y-full" : "translate-y-0",
          transparent
            ? "border-b border-transparent bg-transparent text-ivory"
            : "border-b border-line bg-bg/92 text-fg backdrop-blur-xl backdrop-saturate-150",
        )}
      >
        <div className="container-x grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center">
          {/* Left — primary navigation (desktop) / menu button (mobile) */}
          <nav aria-label="Primary" className="flex items-center">
            <button
              type="button"
              onClick={() => open("menu")}
              aria-label="Open menu"
              className="group -ml-2 grid h-10 w-10 place-items-center lg:hidden"
            >
              <span className="relative block h-2.5 w-5">
                <span className="absolute left-0 top-0 h-px w-5 bg-current transition-[width] duration-300 group-hover:w-3.5" />
                <span className="absolute bottom-0 left-0 h-px w-3.5 bg-current transition-[width] duration-300 group-hover:w-5" />
              </span>
            </button>
            <ul className="hidden items-center gap-8 lg:flex">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href} onPointerEnter={() => (item.menu ? scheduleOpen(item.menu) : scheduleClose())}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    aria-expanded={item.menu ? activeMenu === item.menu : undefined}
                    aria-haspopup={item.menu ? "true" : undefined}
                    onFocus={() => item.menu && scheduleOpen(item.menu)}
                    onKeyDown={(e) => {
                      if (item.menu && e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveMenu(item.menu);
                        requestAnimationFrame(() =>
                          document.querySelector<HTMLAnchorElement>("[data-mega-menu] a")?.focus(),
                        );
                      }
                    }}
                    className="label link-draw py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Centre — wordmark */}
          <Link href="/" aria-label="JustBecho home" className="text-[1.375rem] sm:text-[1.625rem]" onPointerEnter={scheduleClose}>
            <Logo />
          </Link>

          {/* Right — utilities */}
          <div className="flex items-center justify-end gap-1 sm:gap-2" onPointerEnter={scheduleClose}>
            <ul className="mr-5 hidden items-center gap-8 xl:flex">
              {SECONDARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="label link-draw py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => open("search")}
              aria-label="Search (Ctrl K)"
              className="group flex h-10 items-center gap-2 rounded-full px-2.5 transition-colors hover:bg-hover"
            >
              <Search aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.3} />
              <span className="label hidden lg:inline">Search</span>
            </button>
            <HeaderIcon href="/wishlist" label="Wishlist" count={hydrated ? wishCount : 0} className="hidden sm:grid">
              <Heart aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </HeaderIcon>
            <HeaderIcon href="/account" label="Account" className="hidden sm:grid">
              <User aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </HeaderIcon>
            <button
              type="button"
              onClick={() => open("cart")}
              aria-label={`Shopping bag, ${hydrated ? cartCount : 0} items`}
              className="relative -mr-2 grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-hover"
            >
              <ShoppingBag aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.3} />
              <CountBadge count={hydrated ? cartCount : 0} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeMenu ? (
            <MegaMenu
              key="mega"
              data={menu}
              active={activeMenu}
              onNavigate={() => setActiveMenu(null)}
              onPointerEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
            />
          ) : null}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {activeMenu ? (
          <m.div
            key="mega-scrim"
            aria-hidden
            className="fixed inset-0 z-40 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onPointerEnter={scheduleClose}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function HeaderIcon({
  href,
  label,
  count,
  className,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label}, ${count} items` : label}
      className={cn("relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-hover", className)}
    >
      {children}
      {count != null ? <CountBadge count={count} /> : null}
    </Link>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <m.span
          key={count}
          aria-hidden
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 520, damping: 22 } }}
          exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
          className="tabular absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-seal px-1 text-[9px] font-medium leading-none text-paper"
        >
          {count > 9 ? "9+" : count}
        </m.span>
      ) : null}
    </AnimatePresence>
  );
}
