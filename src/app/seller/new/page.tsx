import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ListingWizard } from "@/components/seller/listing-wizard";

export const metadata: Metadata = { title: "New listing" };

export default function NewListingPage() {
  return (
    <PageShell bleed>
      <ListingWizard />
    </PageShell>
  );
}
