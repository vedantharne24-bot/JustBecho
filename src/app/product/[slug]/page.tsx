import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs, SectionHeader } from "@/components/ui/misc";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductCard } from "@/components/product/product-card";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { AuthenticationReport } from "@/components/product/authentication-report";
import { AngleScrubber } from "@/components/product/angle-scrubber";
import { MarketValue } from "@/components/product/market-value";
import { hasMarketHistory, marketHistory } from "@/lib/market";
import { getAllProducts, getBrand, getCategory, getMoreFromSeller, getProduct, getRelated, getSeller } from "@/lib/api/catalog";
import { formatPrice } from "@/lib/format";
import { productDisplayName } from "@/lib/data/brands";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Piece not found" };
  const brand = await getBrand(product.brand);
  return {
    title: productDisplayName(product),
    description: `${brand?.name} ${product.name} — ${formatPrice(product.price)}. ${product.description}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [brand, seller, category, related, fromSeller] = await Promise.all([
    getBrand(product.brand),
    getSeller(product.sellerId),
    getCategory(product.category),
    getRelated(product, 4),
    getMoreFromSeller(product, 4),
  ]);
  if (!brand || !seller || !category) notFound();

  const angleImages = product.angles?.map((i) => product.images[i]).filter(Boolean) ?? [];
  const market = hasMarketHistory(product) ? marketHistory(product) : null;

  return (
    <PageShell>
      <div className="container-x pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: category.name, href: `/categories/${category.slug}` },
            { label: brand.name, href: `/brands/${brand.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-x mt-6 grid grid-cols-1 gap-10 pb-20 lg:mt-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        <div className="-mx-[var(--gutter)] lg:col-span-7 lg:mx-0">
          <ProductGallery
            images={product.images}
            productId={product.id}
            title={productDisplayName(product)}
            sold={product.status === "sold"}
          />
        </div>
        <div className="lg:col-span-5">
          <ProductInfo product={product} brand={brand} seller={seller} />
        </div>
      </div>

      {angleImages.length >= 3 ? <AngleScrubber images={angleImages} title={productDisplayName(product)} /> : null}
      <AuthenticationReport product={product} brandName={brand.name} />
      {market && product.retailPrice ? <MarketValue points={market} retail={product.retailPrice} name={product.name} /> : null}

      {related.length ? (
        <section aria-label="Similar pieces" className="container-x border-t border-line py-20 sm:py-24">
          <SectionHeader
            eyebrow="You may also consider"
            title={
              <>
                Similar <em>pieces</em>
              </>
            }
            href={`/categories/${category.slug}`}
            linkLabel={`All ${category.name.toLowerCase()}`}
          />
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {fromSeller.length ? (
        <section aria-label={`More from ${seller.name}`} className="container-x border-t border-line py-20 sm:py-24">
          <SectionHeader
            eyebrow={`${seller.type === "boutique" ? "Boutique" : "Private seller"} · ${seller.location}`}
            title={
              <>
                More from <em>{seller.name}</em>
              </>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4">
            {fromSeller.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewed excludeId={product.id} />
    </PageShell>
  );
}
