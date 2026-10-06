"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { useToasts, type Toast } from "@/store/toast";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-3 sm:inset-x-auto sm:left-0 sm:items-start sm:p-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToasts((s) => s.dismiss);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = toast.duration ?? 4800;

  const start = () => {
    timer.current = setTimeout(() => dismiss(toast.id), duration);
  };
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <m.div
      layout
      role="status"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ease.out } }}
      exit={{ opacity: 0, y: 12, transition: { duration: 0.2, ease: ease.inOut } }}
      onPointerEnter={stop}
      onPointerLeave={start}
      className={cn(
        "theme-dark pointer-events-auto flex w-full max-w-[380px] items-center gap-3 border border-line bg-onyx/95 p-3 pr-2 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.5)] backdrop-blur-md",
      )}
    >
      {toast.image ? (
        <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-media">
          <Image src={toast.image} alt="" fill sizes="44px" className="object-cover" />
        </div>
      ) : (
        <span
          aria-hidden
          className={cn(
            "ml-1 h-1.5 w-1.5 shrink-0 rounded-full",
            toast.tone === "error" ? "bg-accent" : toast.tone === "success" ? "bg-[#7bc39b]" : "bg-champagne",
          )}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] leading-snug text-fg">{toast.title}</p>
        {toast.description ? (
          <p className="truncate text-xs leading-snug text-muted">{toast.description}</p>
        ) : null}
      </div>
      {toast.action ? (
        toast.action.href ? (
          <Link
            href={toast.action.href}
            onClick={() => dismiss(toast.id)}
            className="label link-undraw shrink-0 px-2 py-1 text-fg"
          >
            {toast.action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick?.();
              dismiss(toast.id);
            }}
            className="label link-undraw shrink-0 px-2 py-1 text-fg"
          >
            {toast.action.label}
          </button>
        )
      ) : null}
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="grid h-8 w-8 shrink-0 place-items-center text-muted transition-colors hover:text-fg"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </m.div>
  );
}
