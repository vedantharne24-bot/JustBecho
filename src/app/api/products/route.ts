import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/api/catalog";

/** GET /api/products?ids=jb-0001,jb-0002 — hydrate client-held product ids */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await getProductsByIds(ids);
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } },
  );
}
