import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SellerEarnings } from "@/components/seller/seller-views";

export const metadata: Metadata = { title: "Earnings" };

export default function SellerEarningsPage() {
  return (
    <PageShell bleed>
      <SellerEarnings />
    </PageShell>
  );
}
