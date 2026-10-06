import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: { default: "Your account", template: "%s · Your account · JustBecho" },
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x pb-28 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+3.5rem)]">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--sticky-top)+2.5rem)] lg:transition-[top] lg:duration-500">
            <AccountNav />
          </div>
        </aside>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
