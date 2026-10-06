import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { CollectionHeader } from "@/components/explore/collection-header";
import { ExploreView } from "@/components/explore/explore-view";
import { getAllProducts, getCategory } from "@/lib/api/catalog";
import type { CategorySlug } from "@/lib/types";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return { title: "Category not found" };
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = (await getAllProducts()).filter((p) => p.category === category.slug);
  const [first, ...rest] = category.name.split(" ");

  return (
    <PageShell>
      <CollectionHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Explore", href: "/explore" }, { label: category.name }]}
        eyebrow={category.tagline}
        title={
          rest.length ? (
            <>
              {first} <em>{rest.join(" ")}</em>
            </>
          ) : (
            <em>{category.name}</em>
          )
        }
        description={category.description}
        count={products.filter((p) => p.status !== "sold").length}
        image={category.image}
      />
      <ExploreView
        products={products}
        locked={{ category: [category.slug as CategorySlug] }}
        basePath={`/categories/${category.slug}`}
      />
    </PageShell>
  );
}
