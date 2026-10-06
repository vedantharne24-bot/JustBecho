"use client";

import { useMemo } from "react";
import type { DeliveryMethod, Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useProducts } from "@/hooks/use-products";
import { DELIVERY_OPTIONS, GST_RATE, protectFeeFor } from "@/lib/orders";

export interface CartRow {
  productId: string;
  size: string;
  quantity: number;
  protect: boolean;
  product: Product;
  maxQuantity: number;
  protectFee: number;
  protectIncluded: boolean;
  unavailable: boolean;
}

export function useCartSummary(delivery: DeliveryMethod = "standard") {
  const lines = useCart((s) => s.lines);
  const ids = useMemo(() => [...new Set(lines.map((l) => l.productId))], [lines]);
  const { map, loading } = useProducts(ids);

  return useMemo(() => {
    const rows: CartRow[] = lines
      .filter((l) => map[l.productId])
      .map((l) => {
        const product = map[l.productId];
        const size = product.sizes.find((s) => s.label === l.size);
        const protectFee = protectFeeFor(product.price, l.protect);
        return {
          ...l,
          product,
          maxQuantity: Math.max(1, size?.stock ?? 1),
          protectFee,
          protectIncluded: protectFee === 0 && l.protect && product.price >= 100000,
          unavailable: product.status === "sold" || (size?.stock ?? 0) === 0,
        };
      });

    const purchasable = rows.filter((r) => !r.unavailable);
    const itemCount = purchasable.reduce((n, r) => n + r.quantity, 0);
    const subtotal = purchasable.reduce((n, r) => n + r.product.price * r.quantity, 0);
    const protect = purchasable.reduce((n, r) => n + r.protectFee * r.quantity, 0);
    const shipping = DELIVERY_OPTIONS.find((d) => d.value === delivery)?.price ?? 0;
    const gst = Math.round((protect + shipping) * GST_RATE);
    const total = subtotal + protect + shipping + gst;

    return {
      rows,
      purchasable,
      itemCount,
      subtotal,
      protect,
      shipping,
      gst,
      total,
      loading: loading && lines.length > 0,
      empty: lines.length === 0,
    };
  }, [lines, map, loading, delivery]);
}
