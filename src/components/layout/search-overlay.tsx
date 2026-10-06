"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { ArrowRight, ArrowUpRight, Clock, Search, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { useHistory } from "@/store/history";
import { useDebounce } from "@/hooks/use-debounce";
import { TRENDING_SEARCHES } from "@/lib/nav";
import { formatPrice } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/misc";
import type { SearchHit } from "@/app/api/search/route";

export interface SearchSuggestion {
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
}

interface SearchResponse {
  q: string;
  total: number;
  products: SearchHit[];
  brands: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
}

type Option = { id: string; href: string; label: string };

export function SearchOverlay({
  suggestions,
  categories,
}: {
  suggestions: SearchSuggestion[];
  categories: { slug: string; name: string; count: number; image: string }[];
}) {
  const isOpen = useUI((s) => s.overlay === "search");
  const close = useUI((s) => s.close);
  const router = useRouter();
  const searches = useHistory((s) => s.searches);
  const pushSearch = useHistory((s) => s.pushSearch);
  const removeSearch = useHistory((s) => s.removeSearch);
  const clearSearches = useHistory((s) => s.clearSearches);

  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [failedQuery, setFailedQuery] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query.trim(), 140);
  const listId = useId();

  // Start fresh each time the overlay closes (adjusting state during render)
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      setActive(-1);
    }
  }

  // Results are "loading" whenever they don't yet answer the current query
  const failed = !!debounced && failedQuery === debounced;
  const loading = !!debounced && data?.q !== debounced && !failed;

  useEffect(() => {
    if (!debounced) return;
    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debounced)}&limit=6`, { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<SearchResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        setData(json);
        setActive(-1);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setFailedQuery(debounced);
      });
    return () => controller.abort();
  }, [debounced]);

  const options: Option[] = useMemo(() => {
    if (!data || !debounced) return [];
    return [
      ...data.products.map((p) => ({ id: `p-${p.id}`, href: `/product/${p.slug}`, label: `${p.brand} ${p.name}` })),
      ...data.brands.map((b) => ({ id: `b-${b.slug}`, href: `/brands/${b.slug}`, label: b.name })),
      ...data.categories.map((c) => ({ id: `c-${c.slug}`, href: `/categories/${c.slug}`, label: c.name })),
    ];
  }, [data, debounced]);

  const go = (href: string, term?: string) => {
    if (term) pushSearch(term);
    close();
    router.push(href);
  };

  const submit = (term = query) => {
    const q = term.trim();
    if (!q) return;
    go(`/explore?q=${encodeURIComponent(q)}`, q);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) go(options[active].href, query.trim());
      else submit();
    }
  };

  const activeId = active >= 0 && options[active] ? `${listId}-${options[active].id}` : undefined;
  const showResults = !!debounced;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && close()}>
      <AnimatePresence>
        {isOpen ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-[60] bg-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                inputRef.current?.focus();
              }}
            >
              <m.div
                className="fixed inset-x-0 top-0 z-[61] flex max-h-[100dvh] flex-col bg-bg text-fg outline-none"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: 0.7, ease: ease.out } }}
                exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.4, ease: ease.inOut } }}
              >
                <Dialog.Title className="sr-only">Search JustBecho</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Search by brand, model or category. Use the arrow keys to move through results.
                </Dialog.Description>

                <form
                  role="search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="container-x flex h-24 items-center gap-4 border-b border-line sm:h-32"
                >
                  <Search aria-hidden className="h-6 w-6 shrink-0 text-muted sm:h-7 sm:w-7" strokeWidth={1} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-expanded={showResults}
                    aria-controls={listId}
                    aria-activedescendant={activeId}
                    aria-autocomplete="list"
                    aria-label="Search"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Search Hermès, Submariner, Jordan…"
                    className="font-display min-w-0 flex-1 bg-transparent text-[1.75rem] leading-none tracking-tight placeholder:text-subtle focus:outline-none sm:text-[3.25rem]"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="label hidden text-muted transition-colors hover:text-fg sm:block"
                    >
                      Clear
                    </button>
                  ) : null}
                  <div className="hidden items-center gap-2 text-muted md:flex">
                    <Kbd>Esc</Kbd>
                  </div>
                  <Dialog.Close
                    aria-label="Close search"
                    className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-hover"
                  >
                    <X className="h-5 w-5" strokeWidth={1.25} />
                  </Dialog.Close>
                </form>

                <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="container-x py-8 sm:py-12" id={listId} role="listbox" aria-label="Search results">
                    <AnimatePresence mode="wait" initial={false}>
                      {showResults ? (
                        <m.div
                          key="results"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.out } }}
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        >
                          <Results
                            data={data}
                            loading={loading}
                            failed={failed}
                            query={debounced}
                            listId={listId}
                            activeId={activeId}
                            onNavigate={(href) => go(href, query.trim())}
                            onSubmit={() => submit()}
                            onTry={(t) => setQuery(t)}
                          />
                        </m.div>
                      ) : (
                        <m.div
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out, delay: 0.15 } }}
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                          className="grid grid-cols-1 gap-12 md:grid-cols-12"
                        >
                          <div className="md:col-span-4">
                            <p className="mono mb-5 text-muted">Trending now</p>
                            <ul className="flex flex-wrap gap-2">
                              {TRENDING_SEARCHES.map((t) => (
                                <li key={t}>
                                  <button
                                    type="button"
                                    onClick={() => submit(t)}
                                    className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-fg"
                                  >
                                    {t}
                                  </button>
                                </li>
                              ))}
                            </ul>
                            {searches.length ? (
                              <div className="mt-10">
                                <div className="mb-4 flex items-center justify-between">
                                  <p className="mono text-muted">Recent</p>
                                  <button type="button" onClick={clearSearches} className="label text-subtle hover:text-fg">
                                    Clear all
                                  </button>
                                </div>
                                <ul className="flex flex-col">
                                  {searches.map((s) => (
                                    <li key={s} className="group flex items-center justify-between border-b border-line">
                                      <button
                                        type="button"
                                        onClick={() => submit(s)}
                                        className="flex flex-1 items-center gap-3 py-3 text-left text-sm"
                                      >
                                        <Clock aria-hidden className="h-3.5 w-3.5 text-subtle" strokeWidth={1.5} />
                                        {s}
                                      </button>
                                      <button
                                        type="button"
                                        aria-label={`Remove ${s} from recent searches`}
                                        onClick={() => removeSearch(s)}
                                        className="grid h-8 w-8 place-items-center text-subtle opacity-60 transition hover:text-fg group-hover:opacity-100"
                                      >
                                        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                          <div className="md:col-span-4">
                            <p className="mono mb-5 text-muted">Categories</p>
                            <ul className="flex flex-col">
                              {categories.map((c) => (
                                <li key={c.slug}>
                                  <button
                                    type="button"
                                    onClick={() => go(`/categories/${c.slug}`)}
                                    className="group flex w-full items-center gap-4 border-b border-line py-2.5 text-left"
                                  >
                                    <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-media">
                                      <Image src={c.image} alt="" fill sizes="40px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                    </span>
                                    <span className="font-display flex-1 text-xl transition-transform duration-500 group-hover:translate-x-1">
                                      {c.name}
                                    </span>
                                    <span className="mono text-subtle">{c.count}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="md:col-span-4">
                            <p className="mono mb-5 text-muted">Most wanted this week</p>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-6">
                              {suggestions.map((p) => (
                                <li key={p.slug}>
                                  <button type="button" onClick={() => go(`/product/${p.slug}`)} className="group block w-full text-left">
                                    <span className="relative block aspect-[4/5] overflow-hidden bg-media">
                                      <Image src={p.image} alt="" fill sizes="(min-width: 768px) 15vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </span>
                                    <span className="label mt-3 block truncate">{p.brand}</span>
                                    <span className="mt-1 block truncate text-xs text-muted">{p.name}</span>
                                    <span className="tabular mt-1 block text-xs">{formatPrice(p.price)}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!tokens.length) return <>{text}</>;
  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        tokens.includes(part.toLowerCase()) ? (
          <mark key={i} className="bg-transparent text-fg underline decoration-accent decoration-1 underline-offset-4">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Results({
  data,
  loading,
  failed,
  query,
  listId,
  activeId,
  onNavigate,
  onSubmit,
  onTry,
}: {
  data: SearchResponse | null;
  loading: boolean;
  failed: boolean;
  query: string;
  listId: string;
  activeId?: string;
  onNavigate: (href: string) => void;
  onSubmit: () => void;
  onTry: (term: string) => void;
}) {
  if (failed) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        Search is taking a moment. Press Enter to see all results for “{query}”.
      </p>
    );
  }

  if (!data || (loading && data.q !== query)) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6" aria-busy>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-3 h-3 w-2/3" />
            <div className="skeleton mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (data.total === 0 && !data.brands.length && !data.categories.length) {
    return (
      <div className="py-12 text-center sm:py-20">
        <p className="display-sm">Nothing matches “{query}” yet.</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          New pieces arrive daily. Try a house or a model name — or set an alert from your wishlist.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TRENDING_SEARCHES.slice(0, 5).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTry(t)}
              className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-fg"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-9">
        <div className="mb-5 flex items-baseline justify-between">
          <p className="mono text-muted">
            {data.total} {data.total === 1 ? "piece" : "pieces"}
          </p>
          {loading ? <span className="mono text-subtle">Updating…</span> : null}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {data.products.map((p) => {
            const id = `${listId}-p-${p.id}`;
            return (
              <li key={p.id} id={id} role="option" aria-selected={activeId === id}>
                <Link
                  href={`/product/${p.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/product/${p.slug}`);
                  }}
                  className={cn("group block outline-offset-4", activeId === id && "outline outline-1 outline-accent")}
                >
                  <span className="relative block aspect-[4/5] overflow-hidden bg-media">
                    <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 12vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    {p.status === "sold" ? (
                      <span className="mono absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-[9px] text-ivory">Sold</span>
                    ) : null}
                  </span>
                  <span className="label mt-3 block truncate">
                    <Highlight text={p.brand} query={query} />
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    <Highlight text={p.name} query={query} />
                  </span>
                  <span className="tabular mt-1 block text-xs">{formatPrice(p.price)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="flex flex-col gap-10 lg:col-span-3">
        {data.brands.length ? (
          <div>
            <p className="mono mb-3 text-muted">Houses</p>
            <ul>
              {data.brands.map((b) => {
                const id = `${listId}-b-${b.slug}`;
                return (
                  <li key={b.slug} id={id} role="option" aria-selected={activeId === id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/brands/${b.slug}`)}
                      className={cn(
                        "group flex w-full items-center justify-between border-b border-line py-3 text-left",
                        activeId === id && "text-accent",
                      )}
                    >
                      <span className="font-display text-xl">
                        <Highlight text={b.name} query={query} />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-subtle group-hover:text-fg" strokeWidth={1.25} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {data.categories.length ? (
          <div>
            <p className="mono mb-3 text-muted">Categories</p>
            <ul>
              {data.categories.map((c) => {
                const id = `${listId}-c-${c.slug}`;
                return (
                  <li key={c.slug} id={id} role="option" aria-selected={activeId === id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/categories/${c.slug}`)}
                      className={cn(
                        "group flex w-full items-center justify-between border-b border-line py-3 text-left",
                        activeId === id && "text-accent",
                      )}
                    >
                      <span className="font-display text-xl">{c.name}</span>
                      <ArrowUpRight className="h-4 w-4 text-subtle group-hover:text-fg" strokeWidth={1.25} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <button type="button" onClick={onSubmit} className="group flex items-center justify-between bg-invert px-5 py-4 text-invert-fg">
          <span className="label">View all {data.total} results</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
        </button>
      </aside>
    </div>
  );
}
