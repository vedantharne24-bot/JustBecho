"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Order, Product } from "@/lib/types";
import { ORDER_STAGES, currentStage, stageIndex } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { productDisplayName } from "@/lib/data/brands";
import { cn } from "@/lib/utils";

export function OrderCard({ order, products }: { order: Order; products: Record<string, Product> }) {
  const stage = currentStage(order);
  const index = stageIndex(stage);
  const meta = ORDER_STAGES[index];
  const delivered = stage === "delivered";
  const progress = index / (ORDER_STAGES.length - 1);
  const first = products[order.lines[0]?.productId];

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group grid grid-cols-1 gap-6 border border-line p-5 transition-colors hover:border-line-strong sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
    >
      <div className="flex -space-x-6">
        {order.lines.slice(0, 3).map((l, i) => {
          const p = products[l.productId];
          return (
            <span
              key={l.productId + l.size}
              className="relative h-24 w-20 overflow-hidden border-2 border-bg bg-media"
              style={{ zIndex: 3 - i }}
            >
              {p ? <Image src={p.images[0].src} alt="" fill sizes="80px" className="object-cover" /> : <span className="skeleton absolute inset-0" />}
            </span>
          );
        })}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="mono">{order.id}</p>
          <p className="mono text-subtle">Placed {formatDate(order.createdAt)}</p>
        </div>
        <p className="mt-2 truncate text-sm">
          {first ? productDisplayName(first) : "Loading…"}
          {order.lines.length > 1 ? <span className="text-muted"> + {order.lines.length - 1} more</span> : null}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-line">
            <div className={cn("h-full transition-[width] duration-1000", delivered ? "bg-success" : "bg-fg")} style={{ width: `${progress * 100}%` }} />
          </div>
          <p className={cn("shrink-0 text-xs", delivered ? "text-success" : "text-fg")}>
            {!delivered ? <span className="mr-2 inline-block h-1.5 w-1.5 animate-[pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-accent align-middle" /> : null}
            {meta.label}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
        <p className="tabular text-sm">{formatPrice(order.total)}</p>
        <span className="label flex items-center gap-1.5 text-muted group-hover:text-fg">
          {delivered ? "Details" : "Track"}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
