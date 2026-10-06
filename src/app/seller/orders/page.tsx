import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SellerOrders } from "@/components/seller/seller-views";

export const metadata: Metadata = { title: "Orders" };

export default function SellerOrdersPage() {
  return (
    <PageShell bleed>
      <SellerOrders />
    </PageShell>
  );
}
