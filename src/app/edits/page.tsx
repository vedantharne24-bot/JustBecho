import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs, Eyebrow } from "@/components/ui/misc";
import { Parallax } from "@/components/motion/parallax";
import { getEdits } from "@/lib/api/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Edits",
  description: "Curated edits for the season — weddings, Diwali gifting, a first watch and streetwear grails.",
};

export default async function EditsPage() {
  const edits = await getEdits();
  return (
    <PageShell>
      <header className="container-x pb-14 pt-8 sm:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Edits" }]} />
        <Eyebrow className="mt-10">Curated by our specialists</Eyebrow>
        <h1 className="display-lg mt-5" data-reveal>
          The <em>Edits.</em>
        </h1>
        <p className="lede mt-6 max-w-xl text-muted" data-reveal>
          Small, considered selections for the moments that call for something particular — each piece authenticated and
          sealed.
        </p>
      </header>

      <ol className="container-x flex flex-col gap-24 pb-28 sm:gap-32">
        {edits.map((edit, i) => (
          <li key={edit.slug} className={cn("grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16")}>
            <Link
              href={`/edits/${edit.slug}`}
              data-cursor="Explore"
              className={cn("group block lg:col-span-7", i % 2 === 1 && "lg:order-2 lg:col-start-6")}
            >
              <div data-reveal="mask" className="relative">
                <Parallax className="aspect-[4/3]" amount={10}>
                  <div className="absolute inset-0" style={{ backgroundColor: edit.tint }} />
                  <Image src={edit.hero.src} alt={edit.hero.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover opacity-90 transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]" />
                </Parallax>
              </div>
            </Link>
            <div className={cn("lg:col-span-4", i % 2 === 1 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9")}>
              <p className="mono text-muted">
                {String(i + 1).padStart(2, "0")} · {edit.kicker}
              </p>
              <h2 className="display-md mt-4" data-reveal>
                {edit.title} <em>{edit.titleItalic}</em>
              </h2>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted" data-reveal>
                {edit.dek}
              </p>
              <Link href={`/edits/${edit.slug}`} className="label group mt-8 inline-flex items-center gap-3">
                <span className="link-draw">Explore {edit.count} pieces</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
