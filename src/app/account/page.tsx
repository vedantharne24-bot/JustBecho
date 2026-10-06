import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = { title: "Overview" };

export default function AccountPage() {
  return (
    <PageShell bleed>
      <AccountOverview />
    </PageShell>
  );
}
