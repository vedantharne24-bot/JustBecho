"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ImagePlus, Search, X } from "lucide-react";
import type { CategorySlug, Condition } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import { CONDITIONS, conditionMap } from "@/lib/conditions";
import { commissionFor } from "@/lib/fees";
import { formatPrice } from "@/lib/format";
import { compressImage } from "@/lib/image-compress";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useSeller } from "@/store/seller";
import { toast } from "@/store/toast";
import { Steps } from "@/components/ui/steps";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, ChoiceCard, Field, Input, Textarea } from "@/components/ui/fields";
import { Seal } from "@/components/ui/seal";

const STEPS = ["Category", "Brand", "Details", "Photos", "Condition", "Price", "Review"];
const INCLUDES = ["Original box", "Dust bag", "Authenticity card", "Receipt", "Papers / warranty", "Extra strap or laces"];
const MIN_PHOTOS = 3;
const MAX_PHOTOS = 8;
const MIN_PRICE = 5000;

interface Draft {
  category: CategorySlug | null;
  brand: string | null;
  title: string;
  subcategory: string;
  size: string;
  colour: string;
  year: string;
  includes: string[];
  description: string;
  images: string[];
  condition: Condition | null;
  flaws: string;
  price: string;
  confirmed: boolean;
}

const EMPTY: Draft = {
  category: null,
  brand: null,
  title: "",
  subcategory: "",
  size: "",
  colour: "",
  year: "",
  includes: [],
  description: "",
  images: [],
  condition: null,
  flaws: "",
  price: "",
  confirmed: false,
};

type Guide = { count: number; low?: number; median?: number; high?: number; basis?: string };

export function ListingWizard() {
  const addListing = useSeller((s) => s.addListing);
  const setStatus = useSeller((s) => s.setListingStatus);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError(null);
  };

  const price = Number(draft.price.replace(/\D/g, ""));
  const category = categories.find((c) => c.slug === draft.category);
  const brandName = brands.find((b) => b.slug === draft.brand)?.name;

  const check = (i: number): string | null => {
    if (i === 0 && !draft.category) return "Choose a category to continue.";
    if (i === 1 && !draft.brand) return "Choose the brand.";
    if (i === 2) {
      if (draft.title.trim().length < 4) return "Give your piece a title — the model name is ideal.";
      if (!draft.subcategory) return "Choose a type.";
      if (draft.description.trim().length < 40) return "Add a description of at least 40 characters — buyers read every word.";
    }
    if (i === 3 && draft.images.length < MIN_PHOTOS) return `Add at least ${MIN_PHOTOS} photos: front, back and a detail.`;
    if (i === 4) {
      if (!draft.condition) return "Choose a condition.";
      if (conditionMap[draft.condition].grade <= 2 && draft.flaws.trim().length < 10) return "Describe the wear so the buyer knows exactly what to expect.";
    }
    if (i === 5 && price < MIN_PRICE) return `The minimum listing price is ${formatPrice(MIN_PRICE)}.`;
    if (i === 6 && !draft.confirmed) return "Please confirm the declaration.";
    return null;
  };

  const go = (next: number) => {
    setStep(next);
    setError(null);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const forward = async () => {
    const problem = check(step);
    if (problem) {
      setError(problem);
      return;
    }
    if (step < STEPS.length - 1) return go(step + 1);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const listing = addListing({
      title: draft.title.trim(),
      brand: draft.brand!,
      category: draft.category!,
      price,
      condition: draft.condition!,
      size: draft.size.trim() || "One size",
      image: draft.images[0],
      images: draft.images,
      description: draft.description.trim(),
    });
    setSubmitting(false);
    setDone(listing.id);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveDraft = () => {
    if (!draft.category || !draft.brand || !draft.title.trim()) {
      setError("Add a category, brand and title before saving a draft.");
      return;
    }
    const listing = addListing({
      title: draft.title.trim(),
      brand: draft.brand,
      category: draft.category,
      price: price || 0,
      condition: draft.condition ?? "excellent",
      size: draft.size.trim() || "One size",
      image: draft.images[0] ?? category!.image.src,
      images: draft.images,
      description: draft.description.trim(),
    });
    setStatus(listing.id, "draft");
    toast({ title: "Draft saved", description: draft.title, action: { label: "Listings", href: "/seller/listings" } });
  };

  if (done) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: ease.out } }}
        className="theme-dark grain relative overflow-hidden p-8 sm:p-14"
      >
        <m.div
          initial={{ scale: 1.7, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 1.3, 0.4, 1], delay: 0.2 }}
          className="w-28 text-[var(--c-seal-bright)]"
        >
          <Seal className="w-full" text="Submitted · In review · Becho Hub · " />
        </m.div>
        <h2 className="display-md mt-10">
          Submitted for <em>review.</em>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
          A {brandName} specialist will review “{draft.title}” within 24 hours. We may suggest a price or ask for one more
          photo — you’ll get a WhatsApp message either way.
        </p>
        <ol className="mt-10 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {[
            ["Within 24 h", "Listing review & pricing check"],
            ["When it sells", "Free insured pickup to the Becho Hub"],
            ["48 h after delivery", `${formatPrice(commissionFor(price).payout)} to your UPI`],
          ].map(([a, b], i) => (
            <li key={a}>
              <p className="mono text-muted">0{i + 1} · {a}</p>
              <p className="mt-2 text-sm">{b}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/seller/listings" variant="light">
            View listings
          </ButtonLink>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(EMPTY);
              setDone(null);
              setStep(0);
            }}
          >
            List another piece
          </Button>
        </div>
      </m.div>
    );
  }

  return (
    <div ref={top} className="scroll-mt-32">
      <Steps steps={STEPS} current={step} onSelect={go} />

      <div className="mt-12 min-h-[22rem]">
        <AnimatePresence mode="wait">
          <m.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.45, ease: ease.out } }}
            exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
          >
            {step === 0 ? (
              <StepBlock title="What are you selling?">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {categories.map((c) => {
                    const on = draft.category === c.slug;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          set("category", c.slug);
                          if (draft.subcategory && !c.subcategories.includes(draft.subcategory)) set("subcategory", "");
                        }}
                        className={cn("group relative block text-left outline-offset-4", on && "outline outline-1 outline-fg")}
                      >
                        <span className="relative block aspect-[4/3] overflow-hidden bg-media">
                          <Image src={c.image.src} alt="" fill sizes="(min-width: 768px) 22vw, 45vw" className={cn("object-cover transition-[transform,filter] duration-700 group-hover:scale-105", !on && draft.category && "grayscale")} />
                        </span>
                        <span className="mt-3 flex items-baseline justify-between">
                          <span className="font-display text-xl">{c.name}</span>
                          <span className="mono text-subtle">{c.tagline}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepBlock>
            ) : null}

            {step === 1 ? <BrandStep value={draft.brand} onChange={(b) => set("brand", b)} /> : null}

            {step === 2 && category ? (
              <StepBlock title="Describe it." hint="Use the model name buyers search for — “Kelly 28 Sellier”, “Submariner Date 126610LN”.">
                <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                  <Field label="Title" htmlFor="l-title" className="sm:col-span-2">
                    <Input id="l-title" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder={`${brandName ?? ""} model name`} />
                  </Field>
                  <div className="sm:col-span-2">
                    <p className="label mb-3 text-muted">Type</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={draft.subcategory === s}
                          onClick={() => set("subcategory", s)}
                          className={cn("rounded-full border px-4 py-2 text-sm transition-colors", draft.subcategory === s ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label={draft.category === "watches" ? "Case size" : "Size"} htmlFor="l-size" optional hint={draft.category === "sneakers" ? "UK size, e.g. UK 9" : undefined}>
                    <Input id="l-size" value={draft.size} onChange={(e) => set("size", e.target.value)} placeholder={draft.category === "watches" ? "41 mm" : "One size"} />
                  </Field>
                  <Field label="Colour" htmlFor="l-colour" optional>
                    <Input id="l-colour" value={draft.colour} onChange={(e) => set("colour", e.target.value)} />
                  </Field>
                  <Field label="Year of purchase" htmlFor="l-year" optional>
                    <Input id="l-year" inputMode="numeric" maxLength={4} value={draft.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))} />
                  </Field>
                  <div className="sm:col-span-2">
                    <p className="label mb-3 text-muted">What’s included</p>
                    <div className="flex flex-wrap gap-2">
                      {INCLUDES.map((inc) => {
                        const on = draft.includes.includes(inc);
                        return (
                          <button
                            key={inc}
                            type="button"
                            aria-pressed={on}
                            onClick={() => set("includes", on ? draft.includes.filter((x) => x !== inc) : [...draft.includes, inc])}
                            className={cn("rounded-full border px-3.5 py-1.5 text-xs transition-colors", on ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                          >
                            {inc}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Field label="Description" htmlFor="l-desc" className="sm:col-span-2" hint={`${draft.description.trim().length}/40 characters minimum`}>
                    <Textarea
                      id="l-desc"
                      rows={5}
                      value={draft.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Where and when you bought it, how it was worn and stored, anything a careful buyer would want to know."
                    />
                  </Field>
                </div>
              </StepBlock>
            ) : null}

            {step === 3 ? <PhotoStep images={draft.images} onChange={(imgs) => set("images", imgs)} /> : null}

            {step === 4 ? (
              <StepBlock title="How would you describe its condition?" hint="Be precise — we’ll verify it at the hub, and accurate listings sell faster.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CONDITIONS.map((c) => (
                    <ChoiceCard
                      key={c.value}
                      name="condition"
                      value={c.value}
                      checked={draft.condition === c.value}
                      onChange={(v) => set("condition", v as Condition)}
                      title={c.label}
                      description={c.description}
                    />
                  ))}
                </div>
                <Field
                  label="Wear, marks or repairs"
                  htmlFor="l-flaws"
                  optional={!draft.condition || conditionMap[draft.condition].grade > 2}
                  className="mt-8"
                >
                  <Textarea id="l-flaws" rows={3} value={draft.flaws} onChange={(e) => set("flaws", e.target.value)} placeholder="e.g. light scratches on the clasp, faint mark inside the flap" />
                </Field>
              </StepBlock>
            ) : null}

            {step === 5 ? <PriceStep draft={draft} price={price} onChange={(v) => set("price", v)} /> : null}

            {step === 6 ? (
              <StepBlock title="Review your listing.">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,14rem)_1fr]">
                  <div>
                    <div className="relative aspect-[4/5] overflow-hidden bg-media">
                      {draft.images[0] ? <Image src={draft.images[0]} alt="Cover photo" fill unoptimized className="object-cover" /> : null}
                    </div>
                    <p className="mono mt-2 text-subtle">{draft.images.length} photos</p>
                  </div>
                  <dl className="divide-y divide-line border-y border-line text-sm">
                    {[
                      ["Category", category?.name, 0],
                      ["Brand", brandName, 1],
                      ["Title", draft.title, 2],
                      ["Type", draft.subcategory, 2],
                      ["Size", draft.size || "One size", 2],
                      ["Includes", draft.includes.join(", ") || "Piece only", 2],
                      ["Condition", draft.condition ? conditionMap[draft.condition].label : "", 4],
                      ["Price", formatPrice(price), 5],
                      ["You receive", formatPrice(commissionFor(price).payout), 5],
                    ].map(([label, value, target]) => (
                      <div key={label as string} className="flex items-baseline justify-between gap-6 py-3">
                        <dt className="label text-muted">{label}</dt>
                        <dd className="flex items-baseline gap-4 text-right">
                          <span>{value}</span>
                          <button type="button" onClick={() => go(target as number)} className="label text-subtle hover:text-fg">
                            Edit
                          </button>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="mt-8">
                  <Checkbox
                    checked={draft.confirmed}
                    onChange={(v) => set("confirmed", v)}
                    label="I confirm this piece is authentic, that I own it, and that the photos and description are accurate."
                  />
                </div>
              </StepBlock>
            ) : null}
          </m.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error ? (
          <m.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-sm text-error"
          >
            {error}
          </m.p>
        ) : null}
      </AnimatePresence>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <div className="flex items-center gap-6">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="label flex items-center gap-2 text-muted hover:text-fg">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.25} /> Back
            </button>
          ) : (
            <Link href="/seller/listings" className="label text-muted hover:text-fg">
              Cancel
            </Link>
          )}
          {step >= 2 ? (
            <button type="button" onClick={saveDraft} className="label link-undraw text-muted hover:text-fg">
              Save draft
            </button>
          ) : null}
        </div>
        <Button onClick={forward} loading={submitting} icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
          {step === STEPS.length - 1 ? "Submit for review" : `Continue to ${STEPS[step + 1].toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}

function StepBlock({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display-sm">{title}</h2>
      {hint ? <p className="mt-3 max-w-xl text-sm text-muted">{hint}</p> : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}

function BrandStep({ value, onChange }: { value: string | null; onChange: (slug: string) => void }) {
  const [q, setQ] = useState("");
  const list = brands.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <StepBlock title="Which house made it?" hint="Only houses we can authenticate are listed. Don’t see yours? Message client care.">
      <label className="relative mb-6 flex items-center">
        <span className="sr-only">Search brands</span>
        <Search aria-hidden className="absolute left-0 h-4 w-4 text-subtle" strokeWidth={1.5} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search houses"
          autoFocus
          className="h-12 w-full border-b border-line-strong bg-transparent pl-7 text-[0.9375rem] placeholder:text-subtle focus:border-fg focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((b) => (
          <button
            key={b.slug}
            type="button"
            aria-pressed={value === b.slug}
            onClick={() => onChange(b.slug)}
            className={cn(
              "flex flex-col items-start border px-4 py-3.5 text-left transition-colors",
              value === b.slug ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
            )}
          >
            <span className="font-display text-lg leading-tight">{b.name}</span>
            <span className={cn("mono mt-1", value === b.slug ? "text-bg/60" : "text-subtle")}>{b.origin}</span>
          </button>
        ))}
        {list.length === 0 ? <p className="col-span-full py-6 text-sm text-muted">No houses match “{q}”.</p> : null}
      </div>
    </StepBlock>
  );
}

function PhotoStep({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, MAX_PHOTOS - images.length);
    if (!list.length) {
      setProblem(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    setProblem(null);
    setBusy(list.length);
    const next = [...images];
    for (const file of list) {
      try {
        next.push(await compressImage(file));
        onChange([...next]);
      } catch (e) {
        setProblem((e as Error).message);
      }
      setBusy((n) => n - 1);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <StepBlock title="Add photos." hint={`At least ${MIN_PHOTOS}: the front, the back, and a close-up of any stamp, serial or hardware. Daylight, no filters. The first photo is the cover.`}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        disabled={images.length >= MAX_PHOTOS}
        className={cn(
          "flex w-full flex-col items-center justify-center border border-dashed px-6 py-14 text-center transition-colors disabled:opacity-40",
          dragging ? "border-fg bg-hover" : "border-line-strong hover:border-fg",
        )}
      >
        <ImagePlus className="h-7 w-7" strokeWidth={1} />
        <span className="mt-4 text-sm">Drop photos here or <span className="underline underline-offset-2">browse</span></span>
        <span className="mono mt-2 text-subtle">
          {images.length} / {MAX_PHOTOS} · JPG, PNG or HEIC
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {problem ? (
        <p role="alert" className="mt-3 text-xs text-error">
          {problem}
        </p>
      ) : null}

      {images.length || busy ? (
        <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={src.slice(-40) + i} className="group relative">
              <span className="relative block aspect-[4/5] overflow-hidden bg-media">
                <Image src={src} alt={`Photo ${i + 1}`} fill unoptimized className="object-cover" />
              </span>
              {i === 0 ? <span className="mono absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-[9px] text-ivory">Cover</span> : null}
              <div className="mt-2 flex items-center justify-between">
                <span className="flex">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} className="grid h-8 w-8 place-items-center text-muted hover:text-fg disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`Move photo ${i + 1} later`} className="grid h-8 w-8 place-items-center text-muted hover:text-fg disabled:opacity-30">
                    <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
                  </button>
                </span>
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`} className="grid h-8 w-8 place-items-center text-muted hover:text-error">
                  <X className="h-4 w-4" strokeWidth={1.25} />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: busy }).map((_, i) => (
            <li key={`busy-${i}`} aria-busy>
              <span className="skeleton block aspect-[4/5]" />
            </li>
          ))}
        </ul>
      ) : null}
    </StepBlock>
  );
}

function PriceStep({ draft, price, onChange }: { draft: Draft; price: number; onChange: (v: string) => void }) {
  const [guide, setGuide] = useState<Guide | null>(null);

  useEffect(() => {
    if (!draft.brand || !draft.category) return;
    const controller = new AbortController();
    fetch(`/api/price-guide?brand=${draft.brand}&category=${draft.category}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setGuide)
      .catch(() => undefined);
    return () => controller.abort();
  }, [draft.brand, draft.category]);

  const { rate, fee, payout } = commissionFor(price || 0);

  return (
    <StepBlock title="Set your price." hint="You can change it any time. Buyers who saved your piece hear about reductions.">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <label htmlFor="l-price" className="label text-muted">
            Listing price
          </label>
          <div className="mt-3 flex items-baseline gap-2 border-b border-line-strong focus-within:border-fg">
            <span className="price text-4xl text-muted">₹</span>
            <input
              id="l-price"
              inputMode="numeric"
              value={draft.price}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "");
                onChange(d ? Number(d).toLocaleString("en-IN") : "");
              }}
              className="price min-w-0 flex-1 bg-transparent py-2 text-5xl leading-none focus:outline-none"
            />
          </div>
          {guide && guide.count > 0 && guide.median ? (
            <div className="mt-8 border border-line p-5">
              <p className="mono text-muted">Pricing guide · {guide.count} comparable pieces</p>
              <div className="mt-4 flex items-baseline justify-between text-sm">
                <span>{formatPrice(guide.low!)}</span>
                <span className="font-display text-2xl">{formatPrice(guide.median)}</span>
                <span>{formatPrice(guide.high!)}</span>
              </div>
              <div className="relative mt-3 h-px bg-line-strong">
                {price > 0 ? (
                  <span
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg bg-accent transition-[left] duration-500"
                    style={{ left: `${Math.min(100, Math.max(0, ((price - guide.low!) / Math.max(1, guide.high! - guide.low!)) * 100))}%` }}
                    aria-hidden
                  />
                ) : null}
              </div>
              <button type="button" onClick={() => onChange(guide.median!.toLocaleString("en-IN"))} className="label link-undraw mt-5 text-fg">
                Use the median
              </button>
            </div>
          ) : null}
        </div>
        <dl className="flex flex-col gap-3 self-start border border-line bg-surface p-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Listing price</dt>
            <dd className="tabular">{formatPrice(price || 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Commission ({Math.round(rate * 100)}%)</dt>
            <dd className="tabular">− {formatPrice(fee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Pickup, authentication, photography</dt>
            <dd>Included</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
            <dt className="label">You receive</dt>
            <dd className="price text-3xl">{formatPrice(payout)}</dd>
          </div>
        </dl>
      </div>
    </StepBlock>
  );
}
