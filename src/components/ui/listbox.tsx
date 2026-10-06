"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ListboxOption<T extends string> {
  value: T;
  label: string;
}

/** Custom select with full keyboard support (Arrow keys, Home/End, Enter, Escape, type-ahead). */
export function Listbox<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
  align = "right",
}: {
  value: T;
  options: ListboxOption<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const commit = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(active);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        buttonRef.current?.focus();
        break;
      default:
        if (e.key.length === 1) {
          const idx = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
          if (idx >= 0) setActive(idx);
        }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className="group flex h-10 items-center gap-2 text-sm"
      >
        <span className="label text-muted">{label}</span>
        <span className="text-fg">{current.label}</span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.25}
          className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open ? (
          <m.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-opt-${active}`}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.out } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            className={cn(
              "absolute top-full z-40 mt-2 min-w-[220px] border border-line bg-surface py-2 shadow-[0_24px_60px_-24px_rgb(12_11_10/0.35)] outline-none",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {options.map((option, i) => {
              const selected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => commit(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-6 px-4 py-2.5 text-sm transition-colors",
                    i === active ? "bg-hover text-fg" : "text-muted",
                  )}
                >
                  {option.label}
                  {selected ? <Check aria-hidden className="h-3.5 w-3.5 text-fg" strokeWidth={1.5} /> : null}
                </li>
              );
            })}
          </m.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
