import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SellerOverview } from "@/components/seller/seller-views";

export const metadata: Metadata = { title: "Overview" };

export default function SellerOverviewPage() {
  return (
    <PageShell bleed>
      <SellerOverview />
    </PageShell>
  );
}
