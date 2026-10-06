import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ui/misc";
import { SellerRegistration } from "@/components/sell/seller-registration";
import { editorial } from "@/lib/images";

export const metadata: Metadata = { title: "Become a seller" };

export default function SellerRegisterPage() {
  return (
    <PageShell>
      <div className="container-x grid grid-cols-1 gap-14 pb-24 pt-8 sm:pt-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Breadcrumbs items={[{ label: "Sell", href: "/sell" }, { label: "Become a seller" }]} />
          <h1 className="display-md mb-12 mt-8">
            Open your <em>store.</em>
          </h1>
          <SellerRegistration />
        </div>
        <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block">
          <div className="sticky top-[calc(var(--sticky-top)+2rem)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-media">
              <Image src={editorial.atelier.src} alt={editorial.atelier.alt} fill sizes="30vw" className="object-cover" />
            </div>
            <ul className="mt-8 flex flex-col gap-4 text-sm">
              {[
                ["2 minutes", "to open your store"],
                ["24 hours", "to listing review"],
                ["48 hours", "from delivery to payout"],
              ].map(([a, b]) => (
                <li key={a} className="flex items-baseline justify-between border-b border-line pb-4">
                  <span className="font-display text-2xl">{a}</span>
                  <span className="text-muted">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
