import type { Metadata } from "next";
import { DepartmentPage } from "@/components/explore/department-page";
import { editorial } from "@/lib/images";

export const metadata: Metadata = {
  title: "Women",
  description: "Authenticated pre-owned bags, watches, jewellery and ready-to-wear for women.",
};

export default async function WomenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await searchParams;
  return (
    <DepartmentPage
      department="women"
      title={
        <>
          For her, <em>verified.</em>
        </>
      }
      description="Kellys and Lady Diors, a Santos for every day, coats cut to last a lifetime — each one inspected by hand."
      image={editorial.heroCoat}
    />
  );
}
