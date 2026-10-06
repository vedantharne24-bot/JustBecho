"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m, type TargetAndTransition } from "motion/react";
import { X } from "lucide-react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Side = "right" | "left" | "bottom" | "center";

const panelMotion: Record<Side, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  center: {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.99 },
  },
};

const panelClass: Record<Side, string> = {
  right: "inset-y-0 right-0 h-dvh w-full max-w-[480px] border-l",
  left: "inset-y-0 left-0 h-dvh w-full max-w-[420px] border-r",
  bottom: "inset-x-0 bottom-0 max-h-[88dvh] w-full border-t",
  center:
    "left-1/2 top-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 border",
};

/**
 * Accessible modal surface built on Radix Dialog (focus trap, Escape,
 * aria wiring) with motion-driven enter/exit.
 */
export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  hideTitle,
  children,
  footer,
  className,
  dark,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  title: string;
  description?: string;
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-[60] bg-scrim backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35, ease: ease.out } }}
                exit={{ opacity: 0, transition: { duration: 0.25, ease: ease.inOut } }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <m.div
                className={cn(
                  "fixed z-[61] flex flex-col border-line bg-bg text-fg outline-none",
                  dark && "theme-dark",
                  panelClass[side],
                  className,
                )}
                initial={panelMotion[side].initial}
                animate={{ ...panelMotion[side].animate, transition: { duration: 0.6, ease: ease.out } }}
                exit={{ ...panelMotion[side].exit, transition: { duration: 0.35, ease: ease.inOut } }}
              >
                <header
                  className={cn(
                    "flex shrink-0 items-start justify-between gap-6 px-5 pt-5 sm:px-8 sm:pt-7",
                    hideTitle && "absolute right-0 top-0 z-10",
                  )}
                >
                  <div className={cn(hideTitle && "sr-only")}>
                    <Dialog.Title className="title">{title}</Dialog.Title>
                    {description ? (
                      <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">{title}</Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close
                    className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-hover"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" strokeWidth={1.25} />
                  </Dialog.Close>
                </header>
                <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:px-8">
                  {children}
                </div>
                {footer ? <footer className="shrink-0 border-t border-line px-5 py-4 sm:px-8 sm:py-5">{footer}</footer> : null}
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
