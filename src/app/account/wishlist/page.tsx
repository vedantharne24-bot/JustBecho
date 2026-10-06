import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/account/account-sections";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";

export const metadata: Metadata = { title: "Wishlist" };

export default function AccountWishlistPage() {
  return (
    <PageShell bleed>
      <SectionTitle eyebrow="Saved" title={<>Your <em>wishlist.</em></>} />
      <WishlistGrid compact />
    </PageShell>
  );
}
