"use client";

import { create } from "zustand";
import { uid } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  image?: string;
  tone?: "default" | "success" | "error";
  action?: { label: string; href?: string; onClick?: () => void };
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastState>()((set) => ({
  toasts: [],
  push: (toast) => {
    const id = uid("t");
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (t: Omit<Toast, "id">) => useToasts.getState().push(t);
