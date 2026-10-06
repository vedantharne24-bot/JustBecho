import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { SettingsPanel } from "@/components/account/account-sections";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageShell bleed>
      <SettingsPanel />
    </PageShell>
  );
}
