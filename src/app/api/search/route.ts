import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";
import { searchBrands, searchCategories, searchProducts } from "@/lib/catalog";
import { getBrandName } from "@/lib/data/brands";

export interface SearchHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  status: string;
}

/** GET /api/search?q=kelly — live search used by the search overlay */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 80);
  const limit = Math.min(Number(searchParams.get("limit") ?? 6) || 6, 24);

  if (!q.trim()) {
    return NextResponse.json({ q, total: 0, products: [], brands: [], categories: [] });
  }

  const matched = searchProducts(q, products);
  const live = [...matched.filter((p) => p.status !== "sold"), ...matched.filter((p) => p.status === "sold")];
  const hits: SearchHit[] = live.slice(0, limit).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: getBrandName(p.brand),
    price: p.price,
    image: p.images[0].src,
    category: p.category,
    status: p.status,
  }));

  return NextResponse.json({
    q,
    total: matched.length,
    products: hits,
    brands: searchBrands(q).map((b) => ({ slug: b.slug, name: b.name })),
    categories: searchCategories(q).map((c) => ({ slug: c.slug, name: c.name })),
  });
}
