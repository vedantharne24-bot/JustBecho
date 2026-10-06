"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import type { CatalogFilters, Product, SortKey } from "@/lib/types";
import {
  SORT_OPTIONS,
  countActiveFilters,
  getFacets,
  parseFilters,
  queryProducts,
  serializeFilters,
} from "@/lib/catalog";
import { categoryMap } from "@/lib/data/categories";
import { brandMap } from "@/lib/data/brands";
import { conditionMap } from "@/lib/conditions";
import { formatPriceCompact, pluralise } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Listbox } from "@/components/ui/listbox";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "./filter-panel";

const PAGE = 12;

type Locked = Partial<Pick<CatalogFilters, "category" | "gender" | "brand">>;

function withLocked(filters: CatalogFilters, locked: Locked): CatalogFilters {
  return { ...filters, ...locked };
}

function withoutLocked(filters: CatalogFilters, locked: Locked): CatalogFilters {
  const next = { ...filters };
  for (const key of Object.keys(locked) as (keyof Locked)[]) delete next[key];
  return next;
}

export function ExploreView({
  products,
  locked = {},
  basePath,
}: {
  products: Product[];
  locked?: Locked;
  basePath: string;
}) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => withLocked(parseFilters(searchParams), locked), [searchParams, locked]);
  const results = useMemo(() => queryProducts(filters, products), [filters, products]);
  const facets = useMemo(() => getFacets(filters, products), [filters, products]);
  const activeCount = countActiveFilters(withoutLocked(filters, locked));

  const [visible, setVisible] = useState(PAGE);
  const [compact, setCompact] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState(filters.q ?? "");
  const typing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridTop = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<CatalogFilters>) => {
    // Read the live URL so queued updates (e.g. debounced search) never act on stale filters
    const current = withLocked(parseFilters(new URLSearchParams(window.location.search)), locked);
    const next = withoutLocked({ ...current, ...patch }, locked);
    const qs = serializeFilters(next).toString();
    // Shallow URL update: shareable, back-button friendly, no server round trip
    window.history.replaceState(null, "", qs ? `${basePath}?${qs}` : basePath);
    setVisible(PAGE);
  };

  const onQuery = (value: string) => {
    setQuery(value);
    if (typing.current) clearTimeout(typing.current);
    typing.current = setTimeout(() => update({ q: value.trim() || undefined }), 280);
  };

  // Reflect external changes to q, e.g. arriving from the global search
  const [lastQ, setLastQ] = useState(filters.q);
  if (lastQ !== filters.q) {
    setLastQ(filters.q);
    if ((filters.q ?? "") !== query.trim()) setQuery(filters.q ?? "");
  }

  const clearAll = () => {
    if (typing.current) clearTimeout(typing.current);
    setQuery("");
    window.history.replaceState(null, "", basePath);
    setVisible(PAGE);
  };

  const chips = buildChips(filters, locked, update);
  const shown = results.slice(0, visible);

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-[var(--sticky-top)] z-30 border-y border-line bg-bg/95 backdrop-blur-xl transition-[top] duration-500 ease-out">
        <div className="container-x flex h-14 items-center gap-4 sm:h-16">
          <button
            type="button"
            onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? setSidebar((s) => !s) : setSheetOpen(true))}
            aria-expanded={sidebar}
            className="label flex h-10 items-center gap-2.5"
          >
            <SlidersHorizontal aria-hidden className="h-4 w-4" strokeWidth={1.25} />
            <span className="hidden lg:inline">{sidebar ? "Hide filters" : "Show filters"}</span>
            <span className="lg:hidden">Filter</span>
            {activeCount ? (
              <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-fg px-1.5 text-[10px] text-bg">
                {activeCount}
              </span>
            ) : null}
          </button>

          <div aria-hidden className="hidden h-5 w-px bg-line sm:block" />

          <label className="relative hidden min-w-0 max-w-xs flex-1 items-center sm:flex">
            <span className="sr-only">Search within results</span>
            <Search aria-hidden className="absolute left-0 h-3.5 w-3.5 text-subtle" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search within"
              className="h-10 w-full bg-transparent pl-6 pr-6 text-sm placeholder:text-subtle focus:outline-none"
            />
            {query ? (
              <button type="button" aria-label="Clear search" onClick={() => onQuery("")} className="absolute right-0 text-subtle hover:text-fg">
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            ) : null}
          </label>

          <p className="mono tabular ml-auto hidden text-muted md:block" aria-live="polite">
            {pluralise(results.length, "piece")}
          </p>

          <Listbox<SortKey>
            label="Sort"
            value={filters.sort ?? "featured"}
            options={SORT_OPTIONS}
            onChange={(sort) => update({ sort })}
            className="ml-auto md:ml-4"
          />

          <div className="hidden items-center gap-1 border-l border-line pl-4 xl:flex" role="group" aria-label="Grid density">
            <button
              type="button"
              aria-pressed={!compact}
              aria-label="Larger images"
              onClick={() => setCompact(false)}
              className={cn("grid h-8 w-8 place-items-center transition-colors", compact ? "text-subtle hover:text-fg" : "text-fg")}
            >
              <Rows3 className="h-4 w-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-pressed={compact}
              aria-label="More pieces per row"
              onClick={() => setCompact(true)}
              className={cn("grid h-8 w-8 place-items-center transition-colors", compact ? "text-fg" : "text-subtle hover:text-fg")}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      <AnimatePresence initial={false}>
        {chips.length ? (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.4, ease: ease.out } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.25 } }}
            className="overflow-hidden"
          >
            <div className="container-x flex flex-wrap items-center gap-2 py-4">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="group flex items-center gap-2 rounded-full border border-line py-1.5 pl-3.5 pr-2.5 text-xs transition-colors hover:border-fg"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  {chip.label}
                  <X aria-hidden className="h-3 w-3 text-subtle group-hover:text-fg" strokeWidth={1.75} />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="label link-undraw ml-2 text-muted hover:text-fg">
                Clear all
              </button>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>

      <div ref={gridTop} className="container-x flex gap-10 pb-24 pt-8 sm:pt-10">
        {/* Desktop sidebar */}
        <AnimatePresence initial={false}>
          {sidebar ? (
            <m.aside
              key="sidebar"
              aria-label="Filters"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 272, opacity: 1, transition: { duration: 0.5, ease: ease.out } }}
              exit={{ width: 0, opacity: 0, transition: { duration: 0.35, ease: ease.inOut } }}
              className="hidden shrink-0 overflow-clip lg:block"
            >
              <div className="sticky top-[calc(var(--sticky-top)+5rem)] w-[272px] pb-10">
                <FilterPanel filters={filters} facets={facets} locked={locked} onChange={update} idPrefix="side" />
              </div>
            </m.aside>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <p className="mono mb-6 text-muted md:hidden" aria-live="polite">
            {pluralise(results.length, "piece")}
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center border border-dashed border-line-strong px-6 py-24 text-center">
              <p className="display-sm max-w-md">Nothing matches — yet.</p>
              <p className="mt-4 max-w-sm text-sm text-muted">
                Pieces clear authentication every day. Loosen a filter, or save a search and we’ll tell you when one arrives.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button onClick={clearAll}>Clear all filters</Button>
              </div>
            </div>
          ) : (
            <>
              <ul
                className={cn(
                  "grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3",
                  sidebar ? (compact ? "xl:grid-cols-4" : "xl:grid-cols-3") : compact ? "lg:grid-cols-5" : "lg:grid-cols-4",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((p, i) => (
                    <m.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out, delay: Math.min(i % PAGE, 8) * 0.03 } }}
                      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                    >
                      <ProductCard
                        product={p}
                        morph
                        eager={i < 4}
                        sizes={compact ? "(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 46vw" : "(min-width: 1280px) 24vw, (min-width: 768px) 30vw, 46vw"}
                      />
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>

              {results.length > PAGE ? (
                <div className="mx-auto mt-20 flex max-w-xs flex-col items-center gap-5 text-center">
                  <p className="mono text-muted">
                    Showing {Math.min(visible, results.length)} of {results.length}
                  </p>
                  <div className="h-px w-full bg-line">
                    <div
                      className="h-full bg-fg transition-[width] duration-700 ease-out"
                      style={{ width: `${(Math.min(visible, results.length) / results.length) * 100}%` }}
                    />
                  </div>
                  {visible < results.length ? (
                    <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
                      Show {Math.min(PAGE, results.length - visible)} more
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        side="bottom"
        title="Filter & sort"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearAll} className="flex-1" disabled={!activeCount}>
              Clear
            </Button>
            <Button onClick={() => setSheetOpen(false)} className="flex-[2]">
              Show {pluralise(results.length, "piece")}
            </Button>
          </div>
        }
      >
        <label className="relative mb-6 flex items-center sm:hidden">
          <span className="sr-only">Search within results</span>
          <Search aria-hidden className="absolute left-0 h-4 w-4 text-subtle" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search within"
            className="h-12 w-full border-b border-line bg-transparent pl-7 text-[0.9375rem] placeholder:text-subtle focus:border-fg focus:outline-none"
          />
        </label>
        <FilterPanel filters={filters} facets={facets} locked={locked} onChange={update} idPrefix="sheet" />
      </Sheet>
    </div>
  );
}

function buildChips(filters: CatalogFilters, locked: Locked, update: (p: Partial<CatalogFilters>) => void) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, remove: () => update({ q: undefined }) });
  if (!locked.category)
    filters.category?.forEach((c) =>
      chips.push({ key: `c-${c}`, label: categoryMap[c].name, remove: () => update({ category: filters.category!.filter((x) => x !== c) }) }),
    );
  if (!locked.gender)
    filters.gender?.forEach((g) =>
      chips.push({ key: `g-${g}`, label: g === "women" ? "Women" : "Men", remove: () => update({ gender: filters.gender!.filter((x) => x !== g) }) }),
    );
  if (!locked.brand)
    filters.brand?.forEach((b) =>
      chips.push({ key: `b-${b}`, label: brandMap[b]?.name ?? b, remove: () => update({ brand: filters.brand!.filter((x) => x !== b) }) }),
    );
  filters.size?.forEach((s) => chips.push({ key: `s-${s}`, label: s, remove: () => update({ size: filters.size!.filter((x) => x !== s) }) }));
  filters.condition?.forEach((c) =>
    chips.push({ key: `k-${c}`, label: conditionMap[c].label, remove: () => update({ condition: filters.condition!.filter((x) => x !== c) }) }),
  );
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `${formatPriceCompact(filters.minPrice)} – ${formatPriceCompact(filters.maxPrice)}`
      : filters.minPrice
        ? `From ${formatPriceCompact(filters.minPrice)}`
        : `Up to ${formatPriceCompact(filters.maxPrice!)}`;
    chips.push({ key: "price", label, remove: () => update({ minPrice: undefined, maxPrice: undefined }) });
  }
  if (filters.availability === "all") chips.push({ key: "sold", label: "Including sold", remove: () => update({ availability: "available" }) });
  if (filters.authenticated) chips.push({ key: "auth", label: "Authenticated only", remove: () => update({ authenticated: undefined }) });
  return chips;
}
