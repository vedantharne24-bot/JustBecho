"use client";

import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  meta?: ReactNode;
}

/** Disclosure list. Height animates with the grid-rows technique (no measuring). */
export function Accordion({
  items,
  defaultOpen = [],
  single = false,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: string[];
  single?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const baseId = useId();

  const toggle = (id: string) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : single ? [id] : [...prev, id]));

  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;
        return (
          <div key={item.id} className="border-b border-line">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="label text-fg">{item.title}</span>
                <span className="flex items-center gap-4">
                  {item.meta ? <span className="text-xs text-muted">{item.meta}</span> : null}
                  <Plus
                    aria-hidden
                    strokeWidth={1.25}
                    className={cn(
                      "h-4 w-4 text-muted transition-transform duration-500 ease-out group-hover:text-fg",
                      isOpen && "rotate-45 text-fg",
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-6 text-sm leading-relaxed text-muted">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
