"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CatalogFilters, Condition } from "@/lib/types";
import type { Facets } from "@/lib/catalog";
import { conditionMap } from "@/lib/conditions";
import { Accordion } from "@/components/ui/accordion";
import { Checkbox, Switch } from "@/components/ui/fields";
import { cn } from "@/lib/utils";
import { PriceRange } from "./price-range";

type Patch = Partial<CatalogFilters>;

function toggle<T extends string>(list: T[] | undefined, value: T): T[] {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return [...set];
}

export function FilterPanel({
  filters,
  facets,
  locked,
  onChange,
  idPrefix = "f",
}: {
  filters: CatalogFilters;
  facets: Facets;
  locked: Partial<CatalogFilters>;
  onChange: (patch: Patch) => void;
  idPrefix?: string;
}) {
  const [brandQuery, setBrandQuery] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);

  const brands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    const list = q ? facets.brand.filter((b) => b.label.toLowerCase().includes(q)) : facets.brand;
    if (showAllBrands || q) return list;
    const selected = list.filter((b) => filters.brand?.includes(b.value));
    const rest = list.filter((b) => !filters.brand?.includes(b.value)).sort((a, b) => b.count - a.count);
    return [...selected, ...rest].slice(0, Math.max(8, selected.length));
  }, [facets.brand, brandQuery, showAllBrands, filters.brand]);

  const items = [
    !locked.category && {
      id: "category",
      title: "Category",
      meta: filters.category?.length || undefined,
      content: (
        <div className="flex flex-col">
          {facets.category.map((c) => (
            <Checkbox
              key={c.value}
              checked={!!filters.category?.includes(c.value)}
              onChange={() => onChange({ category: toggle(filters.category, c.value) })}
              label={c.label}
              count={c.count}
              disabled={c.count === 0 && !filters.category?.includes(c.value)}
            />
          ))}
        </div>
      ),
    },
    !locked.gender && {
      id: "gender",
      title: "Department",
      meta: filters.gender?.length || undefined,
      content: (
        <div className="flex flex-col">
          {facets.gender.map((g) => (
            <Checkbox
              key={g.value}
              checked={!!filters.gender?.includes(g.value)}
              onChange={() => onChange({ gender: toggle(filters.gender, g.value) })}
              label={g.label}
              count={g.count}
            />
          ))}
        </div>
      ),
    },
    !locked.brand && {
      id: "brand",
      title: "Brand",
      meta: filters.brand?.length || undefined,
      content: (
        <div>
          <label className="relative mb-3 flex items-center">
            <span className="sr-only">Search brands</span>
            <Search aria-hidden className="absolute left-0 h-3.5 w-3.5 text-subtle" strokeWidth={1.5} />
            <input
              id={`${idPrefix}-brand-search`}
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              placeholder="Find a house"
              className="h-9 w-full border-b border-line bg-transparent pl-6 text-sm placeholder:text-subtle focus:border-fg focus:outline-none"
            />
          </label>
          <div className="flex flex-col">
            {brands.map((b) => (
              <Checkbox
                key={b.value}
                checked={!!filters.brand?.includes(b.value)}
                onChange={() => onChange({ brand: toggle(filters.brand, b.value) })}
                label={b.label}
                count={b.count}
                disabled={b.count === 0 && !filters.brand?.includes(b.value)}
              />
            ))}
            {brands.length === 0 ? <p className="py-2 text-xs text-subtle">No houses match “{brandQuery}”.</p> : null}
          </div>
          {!brandQuery && facets.brand.length > 8 ? (
            <button
              type="button"
              onClick={() => setShowAllBrands((v) => !v)}
              className="label link-undraw mt-3 text-muted"
            >
              {showAllBrands ? "Show fewer" : `All ${facets.brand.length} houses`}
            </button>
          ) : null}
        </div>
      ),
    },
    {
      id: "price",
      title: "Price",
      meta: filters.minPrice || filters.maxPrice ? "Set" : undefined,
      content: (
        <PriceRange
          bounds={facets.price}
          value={{ min: filters.minPrice, max: filters.maxPrice }}
          onCommit={({ min, max }) => onChange({ minPrice: min, maxPrice: max })}
        />
      ),
    },
    facets.size.length > 0 && {
      id: "size",
      title: "Size",
      meta: filters.size?.length || undefined,
      content: (
        <div className="flex flex-wrap gap-2">
          {facets.size.map((s) => {
            const active = !!filters.size?.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={active}
                disabled={s.count === 0 && !active}
                onClick={() => onChange({ size: toggle(filters.size, s.value) })}
                className={cn(
                  "min-w-12 border px-2.5 py-2 text-xs transition-colors disabled:opacity-30",
                  active ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      id: "condition",
      title: "Condition",
      meta: filters.condition?.length || undefined,
      content: (
        <div className="flex flex-col">
          {facets.condition.map((c) => (
            <Checkbox
              key={c.value}
              checked={!!filters.condition?.includes(c.value)}
              onChange={() => onChange({ condition: toggle<Condition>(filters.condition, c.value) })}
              label={c.label}
              description={conditionMap[c.value].description}
              count={c.count}
              disabled={c.count === 0 && !filters.condition?.includes(c.value)}
            />
          ))}
        </div>
      ),
    },
    {
      id: "availability",
      title: "Availability",
      meta: filters.availability === "all" || filters.authenticated ? "Set" : undefined,
      content: (
        <div className="-my-3 divide-y divide-line">
          <Switch
            checked={filters.availability === "all"}
            onChange={(v) => onChange({ availability: v ? "all" : "available" })}
            label="Include sold pieces"
            description="See what’s sold recently to judge prices."
          />
          <Switch
            checked={!!filters.authenticated}
            onChange={(v) => onChange({ authenticated: v || undefined })}
            label="Authenticated only"
            description="Hide pieces still with our specialists."
          />
        </div>
      ),
    },
  ].filter(Boolean) as { id: string; title: string; meta?: number | string; content: React.ReactNode }[];

  return <Accordion items={items} defaultOpen={["category", "brand", "price"]} />;
}
