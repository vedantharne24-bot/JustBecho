import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ViewedGrid } from "@/components/account/account-sections";

export const metadata: Metadata = { title: "Recently viewed" };

export default function RecentlyViewedPage() {
  return (
    <PageShell bleed>
      <ViewedGrid />
    </PageShell>
  );
}
