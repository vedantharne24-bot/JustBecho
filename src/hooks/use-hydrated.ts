"use client";

import { useUI } from "@/store/ui";

/** True once persisted client stores have been rehydrated from storage. */
export function useHydrated(): boolean {
  return useUI((s) => s.hydrated);
}
