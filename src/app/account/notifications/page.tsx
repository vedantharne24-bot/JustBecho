import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { NotificationsList } from "@/components/account/account-sections";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <PageShell bleed>
      <NotificationsList />
    </PageShell>
  );
}
