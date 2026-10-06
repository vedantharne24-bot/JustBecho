import "server-only";

import { EDITS, editBySlug, type Edit } from "@/lib/data/edits";
import { ARTICLES, articleBySlug, type Article } from "@/lib/data/journal";
import { productBySlug } from "@/lib/data/products";
import type { Product } from "@/lib/types";

/* Editorial content service — would be backed by the CMS (Sanity, Contentful…). */

const resolve = (slugs: string[]): Product[] => slugs.map((s) => productBySlug[s]).filter(Boolean);

export async function getEdits(): Promise<(Edit & { count: number })[]> {
  return EDITS.map((e) => ({ ...e, count: resolve(e.products).filter((p) => p.status !== "sold").length }));
}

export async function getEdit(slug: string): Promise<{ edit: Edit; products: Product[]; next: Edit } | null> {
  const edit = editBySlug[slug];
  if (!edit) return null;
  const i = EDITS.findIndex((e) => e.slug === slug);
  return { edit, products: resolve(edit.products), next: EDITS[(i + 1) % EDITS.length] };
}

export async function getArticles(): Promise<Article[]> {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticle(slug: string): Promise<{ article: Article; related: Article[]; products: Record<string, Product> } | null> {
  const article = articleBySlug[slug];
  if (!article) return null;
  const slugs = article.body.flatMap((b) => (b.type === "products" ? b.slugs : []));
  return {
    article,
    related: ARTICLES.filter((a) => a.slug !== slug).slice(0, 3),
    products: Object.fromEntries(resolve(slugs).map((p) => [p.slug, p])),
  };
}
