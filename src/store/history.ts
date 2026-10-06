"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  viewed: string[];
  searches: string[];
  pushViewed: (id: string) => void;
  clearViewed: () => void;
  pushSearch: (q: string) => void;
  removeSearch: (q: string) => void;
  clearSearches: () => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      viewed: [],
      searches: [],
      pushViewed: (id) => set((s) => ({ viewed: [id, ...s.viewed.filter((v) => v !== id)].slice(0, 16) })),
      clearViewed: () => set({ viewed: [] }),
      pushSearch: (q) => {
        const term = q.trim();
        if (term.length < 2) return;
        set((s) => ({
          searches: [term, ...s.searches.filter((v) => v.toLowerCase() !== term.toLowerCase())].slice(0, 6),
        }));
      },
      removeSearch: (q) => set((s) => ({ searches: s.searches.filter((v) => v !== q) })),
      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: "jb-history",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
