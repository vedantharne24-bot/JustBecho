"use client";

import { create } from "zustand";

type Overlay = "search" | "menu" | "cart" | null;

interface UIState {
  overlay: Overlay;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  hydrated: boolean;
  setHydrated: () => void;
}

/** Only one full-screen layer is open at a time; opening one closes the others. */
export const useUI = create<UIState>()((set) => ({
  overlay: null,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));
