import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { RequestsList } from "@/components/account/account-sections";

export const metadata: Metadata = { title: "Requests" };

export default function RequestsPage() {
  return (
    <PageShell bleed>
      <RequestsList />
    </PageShell>
  );
}
