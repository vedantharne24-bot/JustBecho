import type { Metadata } from "next";
import { SellerShell } from "@/components/seller/seller-shell";

export const metadata: Metadata = {
  title: { default: "Seller centre", template: "%s · Seller centre · JustBecho" },
  robots: { index: false },
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
