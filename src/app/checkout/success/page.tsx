import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { OrderSuccess } from "@/components/checkout/order-success";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <PageShell bleed>
      <Suspense fallback={<div className="theme-dark min-h-[80svh]" aria-busy />}>
        <OrderSuccess />
      </Suspense>
    </PageShell>
  );
}
