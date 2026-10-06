import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { AddressBook } from "@/components/account/account-sections";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <PageShell bleed>
      <AddressBook />
    </PageShell>
  );
}
