"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { Logo } from "@/components/ui/logo";
import { Seal } from "@/components/ui/seal";
import { ease } from "@/lib/motion";

const MAIN = [
  { label: "Explore", href: "/explore" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Brands", href: "/brands" },
  { label: "Edits", href: "/edits" },
  { label: "Sell with us", href: "/sell" },
  { label: "Becho Protect", href: "/protect" },
];

const SECONDARY = [
  { label: "Wishlist", href: "/wishlist" },
  { label: "Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Journal", href: "/journal" },
  { label: "Concierge", href: "/concierge" },
  { label: "Seller dashboard", href: "/seller" },
  { label: "Help", href: "/help" },
];

export function MobileMenu({ categories }: { categories: { slug: string; name: string }[] }) {
  const isOpen = useUI((s) => s.overlay === "menu");
  const close = useUI((s) => s.close);
  const pathname = usePathname();

  useEffect(() => {
    close();
    // Close when the route changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && close()}>
      <AnimatePresence>
        {isOpen ? (
          <Dialog.Portal forceMount>
            <Dialog.Content asChild forceMount>
              <m.div
                className="theme-dark fixed inset-0 z-[70] flex flex-col outline-none"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: 0.7, ease: ease.out } }}
                exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.45, ease: ease.inOut } }}
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
                <div className="container-x flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line">
                  <Link href="/" className="text-[1.375rem]" onClick={close}>
                    <Logo />
                  </Link>
                  <Dialog.Close aria-label="Close menu" className="-mr-2 grid h-10 w-10 place-items-center">
                    <X className="h-5 w-5" strokeWidth={1.25} />
                  </Dialog.Close>
                </div>

                <nav aria-label="Mobile" data-lenis-prevent className="container-x flex min-h-0 flex-1 flex-col overflow-y-auto pb-10 pt-6">
                  <ul className="flex flex-col">
                    {MAIN.map((item, i) => (
                      <m.li
                        key={item.href}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: ease.out, delay: 0.12 + i * 0.05 } }}
                        className="border-b border-line"
                      >
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className="group flex items-center justify-between py-3.5"
                        >
                          <span className="font-display text-[2.4rem] leading-none tracking-tight">{item.label}</span>
                          <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-active:translate-x-1" strokeWidth={1} />
                        </Link>
                      </m.li>
                    ))}
                  </ul>

                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.6 } }}
                    className="mt-8"
                  >
                    <p className="mono mb-3 text-muted">Categories</p>
                    <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)]">
                      {categories.map((c) => (
                        <li key={c.slug} className="shrink-0">
                          <Link
                            href={`/categories/${c.slug}`}
                            onClick={close}
                            className="block rounded-full border border-line px-4 py-2 text-sm"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
                      {SECONDARY.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} onClick={close} className="text-sm text-muted transition-colors hover:text-fg">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </m.div>

                  <div className="mt-auto flex items-center gap-4 pt-10">
                    <Seal className="w-16 text-champagne" />
                    <p className="max-w-[16rem] text-xs leading-relaxed text-muted">
                      Every piece is inspected by hand at our Mumbai atelier before it ships.
                    </p>
                  </div>
                </nav>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
