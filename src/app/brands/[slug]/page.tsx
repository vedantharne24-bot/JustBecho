import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { CollectionHeader } from "@/components/explore/collection-header";
import { ExploreView } from "@/components/explore/explore-view";
import { getAllProducts, getBrand } from "@/lib/api/catalog";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const brand = await getBrand((await params).slug);
  if (!brand) return { title: "House not found" };
  return { title: brand.name, description: `Authenticated pre-owned ${brand.name}. ${brand.blurb}` };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  await searchParams;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const products = (await getAllProducts()).filter((p) => p.brand === brand.slug);
  const hero = products.find((p) => p.status !== "sold")?.images[0];

  return (
    <PageShell>
      <CollectionHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]}
        eyebrow={`${brand.origin} · Est. ${brand.founded}`}
        title={<em>{brand.name}</em>}
        description={brand.blurb}
        count={products.filter((p) => p.status !== "sold").length}
        image={hero}
      />
      <ExploreView products={products} locked={{ brand: [brand.slug] }} basePath={`/brands/${brand.slug}`} />
    </PageShell>
  );
}
