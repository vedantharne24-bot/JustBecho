import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <PageShell>
      <div className="container-x pb-24 pt-10 sm:pt-14">
        <p className="mono text-muted">Secure checkout</p>
        <h1 className="display-md mb-12 mt-4">
          Almost <em>yours.</em>
        </h1>
        <CheckoutFlow />
      </div>
    </PageShell>
  );
}
