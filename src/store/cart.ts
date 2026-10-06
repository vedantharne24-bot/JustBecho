"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

export interface CartState {
  lines: (CartLine & { protect: boolean })[];
  add: (productId: string, size: string, quantity?: number, maxStock?: number) => void;
  remove: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  setSize: (productId: string, from: string, to: string) => void;
  toggleProtect: (productId: string, size: string) => void;
  clear: () => void;
}

const same = (a: { productId: string; size: string }, productId: string, size: string) =>
  a.productId === productId && a.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, size, quantity = 1, maxStock = 99) =>
        set((state) => {
          const existing = state.lines.find((l) => same(l, productId, size));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                same(l, productId, size) ? { ...l, quantity: Math.min(l.quantity + quantity, maxStock) } : l,
              ),
            };
          }
          return {
            lines: [
              { productId, size, quantity: Math.min(quantity, maxStock), addedAt: Date.now(), protect: true },
              ...state.lines,
            ],
          };
        }),
      remove: (productId, size) =>
        set((state) => ({ lines: state.lines.filter((l) => !same(l, productId, size)) })),
      setQuantity: (productId, size, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (same(l, productId, size) ? { ...l, quantity: Math.max(1, quantity) } : l)),
        })),
      setSize: (productId, from, to) =>
        set((state) => ({
          lines: state.lines.map((l) => (same(l, productId, from) ? { ...l, size: to } : l)),
        })),
      toggleProtect: (productId, size) =>
        set((state) => ({
          lines: state.lines.map((l) => (same(l, productId, size) ? { ...l, protect: !l.protect } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "jb-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export const selectCartCount = (s: CartState) => s.lines.reduce((sum, l) => sum + l.quantity, 0);
