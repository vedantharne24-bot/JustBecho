import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SellerListings } from "@/components/seller/seller-views";

export const metadata: Metadata = { title: "Listings" };

export default function SellerListingsPage() {
  return (
    <PageShell bleed>
      <SellerListings />
    </PageShell>
  );
}
