import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, BadgeIndianRupee, Camera, PackageOpen, ShieldCheck, Sparkles, Truck, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/misc";
import { Accordion } from "@/components/ui/accordion";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { EarningsCalculator } from "@/components/sell/earnings-calculator";
import { editorial } from "@/lib/images";
import { COMMISSION_TIERS } from "@/lib/fees";

export const metadata: Metadata = {
  title: "Sell with JustBecho",
  description: "List pre-owned luxury in minutes. We authenticate, ship and get you paid within 48 hours of delivery.",
};

const STEPS = [
  { icon: Camera, title: "List in minutes", body: "Add photos and a few details. Our pricing guide shows what similar pieces sold for." },
  { icon: Sparkles, title: "We review and refine", body: "A specialist checks your listing within 24 hours and suggests edits to sell faster." },
  { icon: Truck, title: "Free pickup to the hub", body: "When it sells, we collect it — insured — and authenticate it at the Becho Hub." },
  { icon: BadgeIndianRupee, title: "Paid in 48 hours", body: "Once the buyer has it, your payout lands in your bank by UPI or NEFT." },
];

const WHY = [
  { icon: ShieldCheck, title: "Authentication, handled", body: "Buyers pay more for verified pieces. Our seal adds trust you can’t buy elsewhere." },
  { icon: Users, title: "Serious buyers only", body: "Collectors across India, with payment secured before you ever ship." },
  { icon: PackageOpen, title: "No photo studio needed", body: "Your photos to list. We reshoot at the hub so the final listing looks its best." },
];

export default function SellPage() {
  return (
    <PageShell bleed>
      {/* Hero */}
      <section className="theme-dark relative overflow-hidden">
        <div className="container-x grid grid-cols-1 min-h-[100svh] items-end gap-12 pb-16 pt-[calc(var(--header-h)+3rem)] lg:grid-cols-12 lg:items-center lg:pb-0">
          <div className="lg:col-span-6">
            <Eyebrow>Sell with JustBecho</Eyebrow>
            <SplitReveal as="h1" className="display-lg mt-8">
              Worth more <em>than you think.</em>
            </SplitReveal>
            <p className="lede mt-8 max-w-md text-muted" data-reveal>
              The piece you no longer wear is someone’s grail. List it in minutes — we authenticate, ship and pay you within
              48 hours of delivery.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5" data-reveal>
              <ButtonLink href="/sell/register" variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
                Start selling
              </ButtonLink>
              <ButtonLink href="#calculator" variant="ghost">
                Estimate your payout
              </ButtonLink>
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:col-start-8">
            <div data-reveal="mask">
              <Parallax className="aspect-[4/5] bg-media" amount={10}>
                <Image src={editorial.bagHands.src} alt={editorial.bagHands.alt} fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </Parallax>
            </div>
            <div className="absolute -left-4 bottom-10 border border-line bg-onyx/95 p-5 backdrop-blur sm:-left-10" data-reveal style={{ ["--reveal-delay" as string]: "300ms" }}>
              <p className="mono text-muted">Sold in 6 days</p>
              <p className="font-display mt-2 text-3xl">₹3,62,560</p>
              <p className="mt-1 text-xs text-muted">Paid to a seller in Chandigarh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section aria-labelledby="why-title" className="container-x py-24 sm:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow index="01">Why JustBecho</Eyebrow>
            <SplitReveal id="why-title" className="display-md mt-6">
              The managed way to <em>sell luxury.</em>
            </SplitReveal>
          </div>
          <ul className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-7">
            {WHY.map(({ icon: Icon, title, body }, i) => (
              <li key={title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
                <Icon className="h-6 w-6" strokeWidth={1} />
                <h3 className="font-display mt-6 text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="border-y border-line bg-surface-2 py-24 sm:py-32">
        <div className="container-x">
          <Eyebrow index="02">How it works</Eyebrow>
          <SplitReveal id="how-title" className="display-md mt-6">
            Four steps. <em>We do three.</em>
          </SplitReveal>
          <ol className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
            <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" data-reveal="line" />
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative" data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}>
                <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-fg bg-surface-2">
                  <Icon className="h-5 w-5" strokeWidth={1.25} />
                </span>
                <p className="mono mt-6 text-muted">Step {i + 1}</p>
                <h3 className="font-display mt-2 text-2xl">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" aria-labelledby="calc-title" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="03">Payout calculator</Eyebrow>
            <SplitReveal id="calc-title" className="display-md mt-6">
              See what <em>you’ll earn.</em>
            </SplitReveal>
          </div>
          <p className="max-w-xs text-sm text-muted">No listing fees. No photography fees. Commission only when it sells.</p>
        </div>
        <EarningsCalculator />
      </section>

      {/* Fees */}
      <section id="fees" aria-labelledby="fees-title" className="container-x scroll-mt-24 border-t border-line py-24 sm:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow index="04">Fees</Eyebrow>
            <h2 id="fees-title" className="display-sm mt-6">
              Lower commission <em>on bigger pieces.</em>
            </h2>
          </div>
          <div className="lg:col-span-8">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Commission by sale price</caption>
              <thead>
                <tr className="border-b border-line-strong">
                  <th scope="col" className="label pb-4 font-medium text-muted">
                    Sale price
                  </th>
                  <th scope="col" className="label pb-4 text-right font-medium text-muted">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMMISSION_TIERS.map((t) => (
                  <tr key={t.label} className="border-b border-line">
                    <td className="py-5">{t.label}</td>
                    <td className="font-display py-5 text-right text-3xl">{Math.round(t.rate * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="mt-8 grid grid-cols-1 gap-3 text-sm text-muted sm:grid-cols-2">
              <li>✓ Free insured pickup</li>
              <li>✓ Authentication & studio photography</li>
              <li>✓ Payment secured before you ship</li>
              <li>✓ Payout within 48 hours of delivery</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Protection + FAQ */}
      <section aria-labelledby="seller-protect-title" className="theme-dark py-24 sm:py-32">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow index="05">Seller protection</Eyebrow>
            <SplitReveal id="seller-protect-title" className="display-md mt-6">
              We protect <em>sellers, too.</em>
            </SplitReveal>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Buyers pay before you ship. Returns are only accepted if a piece isn’t as described — never for a change of
              mind — and every return is inspected before it comes back to you.
            </p>
            <div className="mt-10">
              <ButtonLink href="/sell/register" variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
                Become a seller
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Accordion
              single
              defaultOpen={["what"]}
              items={[
                { id: "what", title: "What can I sell?", content: "Authentic luxury bags, watches, sneakers, streetwear, ready-to-wear, jewellery and sealed fragrance from the houses in our directory." },
                { id: "price", title: "How should I price my piece?", content: "Our pricing guide shows recent sale prices for similar pieces when you list. A specialist may suggest a price that sells faster." },
                { id: "fail", title: "What if my piece fails authentication?", content: "It’s returned to you, insured. Listings with repeated failures are removed from the marketplace." },
                { id: "boutique", title: "I run a boutique. Is there a business plan?", content: "Yes — boutiques get bulk listing tools, a GST invoice workflow and a dedicated account manager." },
              ]}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
