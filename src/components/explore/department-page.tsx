import { PageShell } from "@/components/layout/page-shell";
import { CollectionHeader } from "@/components/explore/collection-header";
import { ExploreView } from "@/components/explore/explore-view";
import { getAllProducts } from "@/lib/api/catalog";
import type { Gender, ProductImage } from "@/lib/types";

const LOCKED: Record<"women" | "men", { gender: Gender[] }> = {
  women: { gender: ["women"] },
  men: { gender: ["men"] },
};

/** Shared body for /women and /men. */
export async function DepartmentPage({
  department,
  title,
  description,
  image,
}: {
  department: "women" | "men";
  title: React.ReactNode;
  description: string;
  image: ProductImage;
}) {
  const products = await getAllProducts();
  const subset = products.filter((p) => p.gender === department || p.gender === "unisex");
  return (
    <PageShell>
      <CollectionHeader
        crumbs={[{ label: "Home", href: "/" }, { label: department === "women" ? "Women" : "Men" }]}
        eyebrow={department === "women" ? "Women" : "Men"}
        title={title}
        description={description}
        count={subset.filter((p) => p.status !== "sold").length}
        image={image}
      />
      <ExploreView products={subset} locked={LOCKED[department]} basePath={`/${department}`} />
    </PageShell>
  );
}
