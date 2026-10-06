import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, BadgeCheck, FileCheck2, PackageCheck, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ProtectStory } from "@/components/protect/protect-story";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/misc";
import { Seal } from "@/components/ui/seal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { editorial } from "@/lib/images";
import { AUTH_CHECKS } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { formatPrice } from "@/lib/format";
import { PROTECT_FEE, PROTECT_INCLUDED_ABOVE } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Becho Protect",
  description:
    "Every piece is shipped to our Mumbai hub, authenticated by a brand specialist, inspected, sealed and insured before it reaches you.",
};

const FAQ = [
  {
    id: "fail",
    title: "What happens if a piece fails authentication?",
    content:
      "You are refunded in full, automatically, within 24 hours. The seller is notified and the piece is returned to them at their cost. Repeat failures lead to removal from the marketplace.",
  },
  {
    id: "who",
    title: "Who authenticates the pieces?",
    content:
      "Specialists assigned by house — leather goods, watches, sneakers, jewellery — trained against a reference library of verified pieces. Watches are opened and timed by a certified watchmaker.",
  },
  {
    id: "optional",
    title: "Is Becho Protect optional?",
    content: `It's complimentary on pieces above ${formatPrice(PROTECT_INCLUDED_ABOVE)}. Below that it's ${formatPrice(PROTECT_FEE)} per piece, and we strongly recommend it — without Protect, a piece ships directly from the seller.`,
  },
  {
    id: "time",
    title: "How long does authentication take?",
    content:
      "Most pieces clear within 48 hours of arriving at the hub. Priority authentication, available at checkout, moves your piece to the front of the queue.",
  },
  {
    id: "after",
    title: "Can I resell a piece with its certificate?",
    content:
      "Yes. Your digital certificate stays in your account and transfers with the piece if you sell it on JustBecho — buyers love a documented history.",
  },
];

export default function ProtectPage() {
  return (
    <PageShell bleed>
      {/* Hero */}
      <section className="theme-dark grain relative isolate flex min-h-[100svh] items-end overflow-hidden pb-14 pt-[calc(var(--header-h)+3rem)] sm:pb-20">
        <Parallax className="absolute! inset-0 -z-10" amount={10} scale={1.12}>
          <Image src={editorial.glovedCaseback.src} alt={editorial.glovedCaseback.alt} fill preload sizes="100vw" className="object-cover opacity-80" />
        </Parallax>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="container-x">
          <Eyebrow>Becho Protect</Eyebrow>
          <SplitReveal as="h1" className="display-xl mt-8 max-w-[14ch]">
            Nothing reaches you <em>unverified.</em>
          </SplitReveal>
          <div className="mt-12 grid grid-cols-1 gap-10 border-t border-line pt-8 md:grid-cols-12">
            <p className="lede text-muted md:col-span-5">
              Every order travels through the Becho Hub in Mumbai. A specialist for that house examines it, our team grades
              its condition, and only then is it sealed and sent to you — insured, end to end.
            </p>
            <dl className="grid grid-cols-3 gap-6 md:col-span-6 md:col-start-7">
              {[
                ["6", "Checkpoints per piece"],
                ["48 h", "Typical authentication"],
                ["100%", "Money-back guarantee"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-4xl sm:text-5xl">{v}</dt>
                  <dd className="mt-2 text-xs text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <ProtectStory id="process" index="01" showLink={false} />

      {/* What we check */}
      <section aria-labelledby="checks-title" className="container-x py-24 sm:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow index="02">By category</Eyebrow>
            <SplitReveal id="checks-title" className="display-md mt-6">
              What our specialists <em>look for.</em>
            </SplitReveal>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              Counterfeits are getting better. So are we — every category has its own protocol, refined against thousands of
              verified pieces.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-x-10 border-t border-line sm:grid-cols-2 lg:col-span-8">
            {categories.map((c, i) => (
              <li key={c.slug} className="border-b border-line py-8" data-reveal style={{ ["--reveal-delay" as string]: `${(i % 2) * 80}ms` }}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-3xl">{c.name}</h3>
                  <span className="mono text-subtle">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <ul className="mt-5 flex flex-col gap-2">
                  {AUTH_CHECKS[c.slug].map((check) => (
                    <li key={check} className="flex items-start gap-3 text-sm text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {check}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Certificate */}
      <section aria-labelledby="cert-title" className="bg-surface-2">
        <div className="container-x grid grid-cols-1 gap-14 py-24 sm:py-32 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Eyebrow index="03">The certificate</Eyebrow>
            <SplitReveal id="cert-title" className="display-md mt-6">
              A record that travels <em>with the piece.</em>
            </SplitReveal>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Each approved piece is sealed with a numbered, tamper-evident tag that matches a digital certificate in your
              account — specialist, date, and every check performed. Sell it on later and the history goes with it.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7" data-reveal>
            <div className="theme-dark relative mx-auto max-w-md overflow-hidden border border-line p-8 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.6)] sm:p-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mono text-muted">Certificate of authenticity</p>
                  <p className="mono mt-1">JB-WT-21362</p>
                </div>
                <Seal className="w-24 text-champagne" />
              </div>
              <p className="font-display mt-8 text-3xl leading-tight">
                Patek Philippe
                <br />
                <em>Nautilus 5711/1A-010</em>
              </p>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted">Verified</dt>
                <dd>1 Oct 2026</dd>
                <dt className="text-muted">Specialist</dt>
                <dd>Arjun Malhotra</dd>
                <dt className="text-muted">Seal</dt>
                <dd className="mono">BP-517324-0026</dd>
              </dl>
              <ul className="mt-8 flex flex-col gap-2 border-t border-line pt-6">
                {AUTH_CHECKS.watches.map((c) => (
                  <li key={c} className="flex items-center gap-2.5 text-xs text-fg/85">
                    <BadgeCheck className="h-3.5 w-3.5 text-[var(--c-seal-bright)]" strokeWidth={1.5} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section aria-labelledby="guarantee-title" className="container-x py-24 sm:py-32">
        <Eyebrow index="04">The guarantee</Eyebrow>
        <SplitReveal id="guarantee-title" className="display-md mt-6 max-w-3xl">
          If it isn’t right, <em>you don’t pay.</em>
        </SplitReveal>
        <ul className="mt-14 grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Authenticity", body: "A full refund if a piece is ever found not to be genuine — no time limit." },
            { icon: FileCheck2, title: "As described", body: "Return within 48 hours of delivery if the condition doesn’t match the report." },
            { icon: PackageCheck, title: "Insured transit", body: "Every leg — seller to hub, hub to you — is insured for the full value." },
            { icon: BadgeCheck, title: "Sealed", body: "A numbered tamper-evident seal you can verify against your certificate." },
          ].map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="border-b border-r border-line p-7 sm:p-8" data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
              <Icon className="h-6 w-6" strokeWidth={1} />
              <h3 className="font-display mt-10 text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="title">Pricing</h2>
            <p className="mt-3 text-sm text-muted">Simple, per piece, shown before you pay.</p>
          </div>
          <dl className="divide-y divide-line border-y border-line lg:col-span-8">
            <div className="flex items-baseline justify-between gap-6 py-5">
              <dt className="text-sm">Pieces under {formatPrice(PROTECT_INCLUDED_ABOVE)}</dt>
              <dd className="font-display text-2xl">{formatPrice(PROTECT_FEE)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-5">
              <dt className="text-sm">Pieces from {formatPrice(PROTECT_INCLUDED_ABOVE)}</dt>
              <dd className="font-display text-2xl">Complimentary</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-5">
              <dt className="text-sm text-muted">Priority authentication (optional)</dt>
              <dd className="text-sm">{formatPrice(1499)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="container-x grid grid-cols-1 gap-10 border-t border-line py-24 sm:py-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="display-sm">
            Questions, <em>answered.</em>
          </h2>
        </div>
        <div className="lg:col-span-8">
          <Accordion items={FAQ} single defaultOpen={["fail"]} />
          <div className="mt-12 flex flex-wrap gap-4">
            <ButtonLink href="/explore" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
              Shop authenticated pieces
            </ButtonLink>
            <ButtonLink href="/help#contact" variant="outline">
              Talk to a specialist
            </ButtonLink>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
