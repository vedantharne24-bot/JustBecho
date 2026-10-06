import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ui/misc";
import { CartView } from "@/components/cart/cart-view";
import { RecentlyViewed } from "@/components/product/recently-viewed";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <PageShell>
      <div className="container-x pb-24 pt-8 sm:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
        <h1 className="display-lg mb-12 mt-8" data-reveal>
          Your <em>bag.</em>
        </h1>
        <CartView />
      </div>
      <RecentlyViewed title="Still thinking about" />
    </PageShell>
  );
}
