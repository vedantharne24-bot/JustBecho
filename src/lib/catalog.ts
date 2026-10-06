import type {
  Brand,
  CatalogFilters,
  Category,
  CategorySlug,
  Condition,
  Gender,
  Product,
  SortKey,
} from "@/lib/types";
import { brandMap, brands } from "@/lib/data/brands";
import { categories, categoryMap } from "@/lib/data/categories";
import { conditionMap } from "@/lib/conditions";
import { toArray } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
   Pure catalogue logic shared by server pages and client views. A search
   service (Algolia, Typesense, Elastic…) would replace `searchProducts` and
   `queryProducts`; their signatures are what the UI depends on.
   ────────────────────────────────────────────────────────────────────────── */

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Curated" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "most-saved", label: "Most wanted" },
];

const ALIASES: Record<string, string> = {
  lv: "louis vuitton",
  ysl: "saint laurent",
  ap: "audemars piguet",
  aj1: "air jordan 1",
  aj: "air jordan",
  sub: "submariner",
  cdg: "comme des garcons",
  bv: "bottega veneta",
  fog: "fear of god",
  "hermes": "hermès",
};

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandQuery(q: string): string[] {
  const base = normalise(q);
  if (!base) return [];
  const expanded = base
    .split(" ")
    .map((token) => (ALIASES[token] ? normalise(ALIASES[token]) : token))
    .join(" ");
  return expanded.split(" ").filter(Boolean);
}

function haystack(product: Product): string {
  const brand = brandMap[product.brand]?.name ?? "";
  return normalise(
    [
      brand,
      product.name,
      categoryMap[product.category]?.name,
      product.subcategory,
      product.colour,
      product.material,
      product.tags.join(" "),
      product.year ?? "",
    ].join(" "),
  );
}

const HAYSTACKS = new Map<string, string>();
function getHaystack(product: Product): string {
  let value = HAYSTACKS.get(product.id);
  if (!value) {
    value = haystack(product);
    HAYSTACKS.set(product.id, value);
  }
  return value;
}

/** Relevance score; 0 means no match */
export function scoreProduct(product: Product, tokens: string[]): number {
  if (tokens.length === 0) return 1;
  const text = getHaystack(product);
  const brand = normalise(brandMap[product.brand]?.name ?? "");
  const name = normalise(product.name);
  let score = 0;
  for (const token of tokens) {
    if (!text.includes(token)) return 0;
    if (brand.startsWith(token) || brand.split(" ").includes(token)) score += 6;
    if (name.split(" ").includes(token)) score += 4;
    else if (name.includes(token)) score += 2;
    else score += 1;
  }
  return score;
}

export function searchProducts(query: string, list: Product[]): Product[] {
  const tokens = expandQuery(query);
  if (tokens.length === 0) return list;
  return list
    .map((product) => ({ product, score: scoreProduct(product, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.product.saves - a.product.saves)
    .map((r) => r.product);
}

export function searchBrands(query: string): Brand[] {
  const q = normalise(ALIASES[normalise(query)] ?? query);
  if (!q) return [];
  return brands.filter((b) => normalise(b.name).includes(q) || b.slug.includes(q.replace(/ /g, "-"))).slice(0, 4);
}

export function searchCategories(query: string): Category[] {
  const q = normalise(query);
  if (!q) return [];
  return categories.filter(
    (c) => normalise(c.name).includes(q) || c.subcategories.some((s) => normalise(s).includes(q)),
  );
}

/* ── Filtering & sorting ──────────────────────────────────────────────── */

function featuredScore(p: Product): number {
  const pick = p.tags.includes("editors-pick") ? 4000 : 0;
  const recency = new Date(p.listedAt).getTime() / 8.64e7; // days
  return pick + p.saves * 2 + recency * 0.5;
}

export function sortProducts(list: Product[], sort: SortKey = "featured"): Product[] {
  const sorted = [...list];
  const availabilityRank = (p: Product) => (p.status === "sold" ? 1 : 0);
  sorted.sort((a, b) => {
    const avail = availabilityRank(a) - availabilityRank(b);
    if (avail !== 0) return avail;
    switch (sort) {
      case "newest":
        return b.listedAt.localeCompare(a.listedAt);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "most-saved":
        return b.saves - a.saves;
      default:
        return featuredScore(b) - featuredScore(a);
    }
  });
  return sorted;
}

export function applyFilters(list: Product[], f: CatalogFilters, skip?: keyof CatalogFilters): Product[] {
  const tokens = f.q && skip !== "q" ? expandQuery(f.q) : [];
  return list.filter((p) => {
    if (tokens.length && scoreProduct(p, tokens) === 0) return false;
    if (skip !== "category" && f.category?.length && !f.category.includes(p.category)) return false;
    if (skip !== "gender" && f.gender?.length && !f.gender.includes(p.gender) && p.gender !== "unisex") return false;
    if (skip !== "brand" && f.brand?.length && !f.brand.includes(p.brand)) return false;
    if (skip !== "condition" && f.condition?.length && !f.condition.includes(p.condition)) return false;
    if (skip !== "size" && f.size?.length && !p.sizes.some((s) => f.size!.includes(s.label) && s.stock > 0)) return false;
    if (skip !== "minPrice" && f.minPrice != null && p.price < f.minPrice) return false;
    if (skip !== "maxPrice" && f.maxPrice != null && p.price > f.maxPrice) return false;
    if (skip !== "availability" && f.availability !== "all" && p.status === "sold") return false;
    if (skip !== "authenticated" && f.authenticated && p.authentication.status !== "authenticated") return false;
    return true;
  });
}

export function queryProducts(filters: CatalogFilters, list: Product[]): Product[] {
  const filtered = applyFilters(list, filters);
  if (filters.q && (!filters.sort || filters.sort === "featured")) {
    // Relevance ordering for search, sold pieces last
    const ordered = searchProducts(filters.q, filtered);
    return [...ordered.filter((p) => p.status !== "sold"), ...ordered.filter((p) => p.status === "sold")];
  }
  return sortProducts(filtered, filters.sort);
}

/* ── Facets ───────────────────────────────────────────────────────────── */

export interface Facet<T extends string = string> {
  value: T;
  label: string;
  count: number;
}

export interface Facets {
  category: Facet<CategorySlug>[];
  gender: Facet<Gender>[];
  brand: Facet[];
  size: Facet[];
  condition: Facet<Condition>[];
  price: { min: number; max: number };
}

function countBy<T extends string>(list: Product[], pick: (p: Product) => T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const p of list) for (const key of pick(p)) counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
}

/**
 * Facet counts are computed against the result set *without* the facet's own
 * filter, so users always see how many results each option would give.
 */
export function getFacets(filters: CatalogFilters, list: Product[]): Facets {
  const byCategory = countBy(applyFilters(list, filters, "category"), (p) => [p.category]);
  const byGender = countBy(applyFilters(list, filters, "gender"), (p) =>
    p.gender === "unisex" ? (["women", "men"] as Gender[]) : [p.gender],
  );
  const byBrand = countBy(applyFilters(list, filters, "brand"), (p) => [p.brand]);
  const bySize = countBy(applyFilters(list, filters, "size"), (p) =>
    p.sizes.filter((s) => s.stock > 0 && s.label !== "One size").map((s) => s.label),
  );
  const byCondition = countBy(applyFilters(list, filters, "condition"), (p) => [p.condition]);
  const prices = list.map((p) => p.price);

  return {
    category: categories.map((c) => ({ value: c.slug, label: c.name, count: byCategory.get(c.slug) ?? 0 })),
    gender: [
      { value: "women", label: "Women", count: byGender.get("women") ?? 0 },
      { value: "men", label: "Men", count: byGender.get("men") ?? 0 },
    ],
    brand: brands
      .map((b) => ({ value: b.slug, label: b.name, count: byBrand.get(b.slug) ?? 0 }))
      .filter((b) => b.count > 0 || filters.brand?.includes(b.value))
      .sort((a, b) => a.label.localeCompare(b.label)),
    size: sortSizes([...bySize.entries()].map(([value, count]) => ({ value, label: value, count }))),
    condition: (Object.keys(conditionMap) as Condition[]).map((c) => ({
      value: c,
      label: conditionMap[c].label,
      count: byCondition.get(c) ?? 0,
    })),
    price: { min: Math.min(...prices), max: Math.max(...prices) },
  };
}

const ALPHA = ["XS", "S", "M", "L", "XL", "XXL"];
function sizeRank(label: string): number {
  const alpha = ALPHA.indexOf(label);
  if (alpha >= 0) return alpha;
  const num = parseFloat(label.replace(/[^0-9.]/g, ""));
  const system = label.split(" ")[0];
  const offset = { UK: 100, EU: 200, IT: 300 }[system] ?? 400;
  return Number.isNaN(num) ? 999 : offset + num;
}
function sortSizes(list: Facet[]): Facet[] {
  return list.sort((a, b) => sizeRank(a.value) - sizeRank(b.value));
}

/* ── URL <-> filters ──────────────────────────────────────────────────── */

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(source: ParamSource, key: string): string | string[] | undefined {
  if (source instanceof URLSearchParams) {
    const all = source.getAll(key);
    return all.length > 1 ? all : (all[0] ?? undefined);
  }
  return source[key];
}

export function parseFilters(source: ParamSource): CatalogFilters {
  const num = (key: string) => {
    const v = read(source, key);
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const str = (key: string) => {
    const v = read(source, key);
    return (Array.isArray(v) ? v[0] : v) || undefined;
  };
  const sort = str("sort") as SortKey | undefined;
  return {
    q: str("q"),
    category: toArray<CategorySlug>(read(source, "category")).filter((c) => c in categoryMap),
    gender: toArray<Gender>(read(source, "gender")).filter((g) => g === "women" || g === "men"),
    brand: toArray(read(source, "brand")).filter((b) => b in brandMap),
    size: toArray(read(source, "size")),
    condition: toArray<Condition>(read(source, "condition")).filter((c) => c in conditionMap),
    minPrice: num("min"),
    maxPrice: num("max"),
    availability: str("availability") === "all" ? "all" : "available",
    authenticated: str("verified") === "1" ? true : undefined,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : undefined,
  };
}

export function serializeFilters(f: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.category?.length) params.set("category", f.category.join(","));
  if (f.gender?.length) params.set("gender", f.gender.join(","));
  if (f.brand?.length) params.set("brand", f.brand.join(","));
  if (f.size?.length) params.set("size", f.size.join(","));
  if (f.condition?.length) params.set("condition", f.condition.join(","));
  if (f.minPrice) params.set("min", String(f.minPrice));
  if (f.maxPrice) params.set("max", String(f.maxPrice));
  if (f.availability === "all") params.set("availability", "all");
  if (f.authenticated) params.set("verified", "1");
  if (f.sort && f.sort !== "featured") params.set("sort", f.sort);
  return params;
}

export function exploreHref(f: CatalogFilters): string {
  const qs = serializeFilters(f).toString();
  return qs ? `/explore?${qs}` : "/explore";
}

export function countActiveFilters(f: CatalogFilters, locked: Partial<CatalogFilters> = {}): number {
  let n = 0;
  const lists: (keyof CatalogFilters)[] = ["category", "gender", "brand", "size", "condition"];
  for (const key of lists) {
    const values = (f[key] as string[] | undefined) ?? [];
    const lockedValues = (locked[key] as string[] | undefined) ?? [];
    n += values.filter((v) => !lockedValues.includes(v)).length;
  }
  if (f.minPrice || f.maxPrice) n += 1;
  if (f.availability === "all") n += 1;
  if (f.authenticated) n += 1;
  return n;
}
