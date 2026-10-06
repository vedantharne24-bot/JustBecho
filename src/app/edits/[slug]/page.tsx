import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ui/misc";
import { ProductCard } from "@/components/product/product-card";
import { Parallax } from "@/components/motion/parallax";
import { SplitReveal } from "@/components/motion/split-reveal";
import { getEdit } from "@/lib/api/editorial";
import { EDITS } from "@/lib/data/edits";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return EDITS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const data = await getEdit((await params).slug);
  if (!data) return { title: "Edit not found" };
  return { title: `${data.edit.title} ${data.edit.titleItalic}`, description: data.edit.dek };
}

export default async function EditPage({ params }: { params: Promise<Params> }) {
  const data = await getEdit((await params).slug);
  if (!data) notFound();
  const { edit, products, next } = data;

  return (
    <PageShell bleed>
      <section className="theme-dark grain relative isolate overflow-hidden" style={{ backgroundColor: edit.tint }}>
        <div className="container-x grid min-h-[100svh] grid-cols-1 items-end gap-12 pb-16 pt-[calc(var(--header-h)+2.5rem)] lg:grid-cols-12 lg:items-center lg:pb-0">
          <div className="lg:col-span-6">
            <Breadcrumbs items={[{ label: "Edits", href: "/edits" }, { label: `${edit.title} ${edit.titleItalic}` }]} />
            <p className="mono mt-10 text-muted">{edit.kicker}</p>
            <SplitReveal as="h1" className="display-xl mt-6">
              {edit.title} <em>{edit.titleItalic}</em>
            </SplitReveal>
            <p className="lede mt-8 max-w-md text-muted" data-reveal>
              {edit.dek}
            </p>
            <p className="mono mt-8 text-subtle">{products.length} pieces · authenticated</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div data-reveal="mask">
              <Parallax className="aspect-[4/5]" amount={12}>
                <Image src={edit.hero.src} alt={edit.hero.alt} fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </Parallax>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x grid grid-cols-1 gap-12 py-24 sm:py-32 lg:grid-cols-12">
        <div className="lg:col-span-6">
          {edit.intro.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-lg leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8]"
                  : "mt-6 text-[0.9375rem] leading-relaxed text-muted"
              }
              data-reveal
            >
              {p}
            </p>
          ))}
        </div>
        <figure className="border-l border-line pl-8 lg:col-span-5 lg:col-start-8" data-reveal>
          <blockquote className="display-sm italic leading-[1.15]">“{edit.quote.text}”</blockquote>
          <figcaption className="mono mt-6 text-muted">{edit.quote.by}</figcaption>
        </figure>
      </section>

      <section aria-label="Pieces in this edit" className="container-x pb-24 sm:pb-32">
        <div className="grid grid-cols-2 gap-x-3 gap-y-14 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <Link href={`/edits/${next.slug}`} className="group theme-dark relative block overflow-hidden" style={{ backgroundColor: next.tint }}>
        <div className="container-x flex flex-col gap-6 py-20 sm:flex-row sm:items-end sm:justify-between sm:py-28">
          <div>
            <p className="mono text-muted">Next edit</p>
            <p className="display-lg mt-4 transition-transform duration-700 ease-out group-hover:translate-x-3">
              {next.title} <em>{next.titleItalic}</em>
            </p>
          </div>
          <ArrowRight className="h-8 w-8 transition-transform duration-700 ease-out group-hover:translate-x-2" strokeWidth={1} />
        </div>
      </Link>
    </PageShell>
  );
}
