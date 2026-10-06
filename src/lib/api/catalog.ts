import "server-only";

import type { Brand, CatalogFilters, Category, CategorySlug, Product, Seller } from "@/lib/types";
import { products, productBySlug, productMap } from "@/lib/data/products";
import { brandMap, brands } from "@/lib/data/brands";
import { categories, categoryMap } from "@/lib/data/categories";
import { sellerMap } from "@/lib/data/sellers";
import { queryProducts, sortProducts } from "@/lib/catalog";

/* ──────────────────────────────────────────────────────────────────────────
   Catalogue service façade used by Server Components.
   Each function is async and returns plain serialisable data, so replacing
   the in-memory seed with `fetch(`${API}/products…`)` is a local change.
   ────────────────────────────────────────────────────────────────────────── */

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProducts(filters: CatalogFilters = {}): Promise<Product[]> {
  return queryProducts(filters, products);
}

export async function getProduct(slug: string): Promise<Product | null> {
  return productBySlug[slug] ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return ids.map((id) => productMap[id]).filter(Boolean);
}

export async function getNewArrivals(limit = 10): Promise<Product[]> {
  return sortProducts(
    products.filter((p) => p.status === "available"),
    "newest",
  ).slice(0, limit);
}

export async function getMostWanted(limit = 8): Promise<Product[]> {
  return sortProducts(
    products.filter((p) => p.status !== "sold"),
    "most-saved",
  ).slice(0, limit);
}

export async function getByTag(tag: string, limit = 8): Promise<Product[]> {
  return sortProducts(products.filter((p) => p.tags.includes(tag) && p.status !== "sold")).slice(0, limit);
}

export async function getRelated(product: Product, limit = 8): Promise<Product[]> {
  const scored = products
    .filter((p) => p.id !== product.id && p.status !== "sold")
    .map((p) => {
      let score = 0;
      if (p.category === product.category) score += 4;
      if (p.brand === product.brand) score += 3;
      if (p.subcategory === product.subcategory) score += 2;
      if (p.gender === product.gender || p.gender === "unisex") score += 1;
      const ratio = p.price / product.price;
      if (ratio > 0.5 && ratio < 2) score += 1;
      return { p, score };
    })
    .filter((r) => r.score >= 4)
    .sort((a, b) => b.score - a.score || b.p.saves - a.p.saves);
  return scored.slice(0, limit).map((r) => r.p);
}

export async function getMoreFromSeller(product: Product, limit = 4): Promise<Product[]> {
  return products
    .filter((p) => p.sellerId === product.sellerId && p.id !== product.id && p.status !== "sold")
    .slice(0, limit);
}

export async function getCategories(): Promise<(Category & { count: number })[]> {
  return categories.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.slug && p.status !== "sold").length,
  }));
}

export async function getCategory(slug: string): Promise<Category | null> {
  return categoryMap[slug as CategorySlug] ?? null;
}

export async function getBrands(): Promise<(Brand & { count: number })[]> {
  return brands
    .map((b) => ({ ...b, count: products.filter((p) => p.brand === b.slug && p.status !== "sold").length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBrand(slug: string): Promise<Brand | null> {
  return brandMap[slug] ?? null;
}

export async function getSeller(id: string): Promise<Seller | null> {
  return sellerMap[id] ?? null;
}

export async function getCatalogStats() {
  const live = products.filter((p) => p.status !== "sold");
  return {
    live: live.length,
    brands: new Set(products.map((p) => p.brand)).size,
    authenticated: 12480,
  };
}
