"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHistory } from "@/store/history";
import { useAccount } from "@/store/account";
import { useSeller } from "@/store/seller";
import { useUI } from "@/store/ui";

/**
 * Persisted stores skip automatic hydration so the first client render matches
 * the server. They are restored here, after mount, in one pass.
 */
export function StoreHydrator() {
  useEffect(() => {
    Promise.all([
      useCart.persist.rehydrate(),
      useWishlist.persist.rehydrate(),
      useHistory.persist.rehydrate(),
      useAccount.persist.rehydrate(),
      useSeller.persist.rehydrate(),
    ]).finally(() => useUI.getState().setHydrated());
  }, []);

  return null;
}
