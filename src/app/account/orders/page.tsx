import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { OrdersList } from "@/components/account/account-sections";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <PageShell bleed>
      <OrdersList />
    </PageShell>
  );
}
