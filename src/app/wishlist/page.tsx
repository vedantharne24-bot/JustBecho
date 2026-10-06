import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs, Eyebrow } from "@/components/ui/misc";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { RecentlyViewed } from "@/components/product/recently-viewed";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <PageShell>
      <div className="container-x pb-24 pt-8 sm:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <Eyebrow className="mt-10">Saved pieces</Eyebrow>
        <h1 className="display-lg mt-5 mb-12" data-reveal>
          Your <em>wishlist.</em>
        </h1>
        <WishlistGrid />
      </div>
      <RecentlyViewed />
    </PageShell>
  );
}
