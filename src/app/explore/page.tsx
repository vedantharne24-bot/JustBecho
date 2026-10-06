import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { CollectionHeader } from "@/components/explore/collection-header";
import { ExploreView } from "@/components/explore/explore-view";
import { getAllProducts, getCategories } from "@/lib/api/catalog";
import { parseFilters } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Explore",
  description: "Every authenticated piece on JustBecho — filter by house, category, size, condition and price.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [products, categories, params] = await Promise.all([getAllProducts(), getCategories(), searchParams]);
  const filters = parseFilters(params);
  const live = products.filter((p) => p.status !== "sold").length;

  return (
    <PageShell>
      <CollectionHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Explore" }]}
        eyebrow={filters.q ? "Search" : "The full edit"}
        title={
          filters.q ? (
            <>
              Results for <em>“{filters.q}”</em>
            </>
          ) : (
            <>
              Everything, <em>authenticated.</em>
            </>
          )
        }
        description="Every piece below has been — or is being — inspected by hand at the Becho Hub. Filter by house, size, condition or price."
        count={live}
        aside={
          <nav aria-label="Categories" className="no-scrollbar -mx-[var(--gutter)] mt-10 flex gap-2 overflow-x-auto px-[var(--gutter)]">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="shrink-0 rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-fg"
              >
                {c.name}
                <span className="mono ml-2 text-subtle">{c.count}</span>
              </Link>
            ))}
          </nav>
        }
      />
      <ExploreView products={products} basePath="/explore" />
    </PageShell>
  );
}
