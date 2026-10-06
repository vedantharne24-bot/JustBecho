import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { OrderTracking } from "@/components/account/order-tracking";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return { title: `Order ${(await params).id}` };
}

export default async function OrderPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <PageShell bleed>
      <OrderTracking id={id} />
    </PageShell>
  );
}
