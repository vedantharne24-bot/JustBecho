import type { Metadata } from "next";
import { DepartmentPage } from "@/components/explore/department-page";
import { photo } from "@/lib/images";

export const metadata: Metadata = {
  title: "Men",
  description: "Authenticated pre-owned watches, sneakers, streetwear and tailoring for men.",
};

export default async function MenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await searchParams;
  return (
    <DepartmentPage
      department="men"
      title={
        <>
          For him, <em>proven.</em>
        </>
      }
      description="Submariners and Speedmasters, Jordans from the vault, cashmere overcoats — authenticated before they leave Mumbai."
      image={photo("1619603364937-8d7af41ef206", "Man in a camel cashmere overcoat and turtleneck", { tone: "light" })}
    />
  );
}
