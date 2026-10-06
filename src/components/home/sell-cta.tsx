import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { editorial } from "@/lib/images";
import { Eyebrow } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { commissionFor } from "@/lib/fees";
import { formatPrice } from "@/lib/format";

const EXAMPLE_PRICE = 1980000;

export function SellCta() {
  const { payout, rate } = commissionFor(EXAMPLE_PRICE);
  return (
    <section aria-labelledby="sell-title" className="bg-surface-2">
      <div className="container-x grid grid-cols-1 gap-14 py-24 sm:py-32 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow index="08">Sell with JustBecho</Eyebrow>
          <SplitReveal id="sell-title" className="display-lg mt-6">
            Your wardrobe is an <em>asset.</em>
          </SplitReveal>
          <p className="lede mt-6 max-w-md text-muted" data-reveal>
            List in minutes. We authenticate, photograph, ship and get you paid — commission from {Math.round(rate * 100)}% on
            high-value pieces, payouts within 48 hours of delivery.
          </p>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-8" data-reveal>
            {[
              ["48 h", "Payout after delivery"],
              ["8–18%", "Tiered commission"],
              ["₹0", "To list a piece"],
            ].map(([figure, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl sm:text-4xl">{figure}</dt>
                <dd className="mt-2 text-xs leading-snug text-muted">{label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <ButtonLink href="/sell/register" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
              Start selling
            </ButtonLink>
            <Link href="/sell#calculator" className="label link-undraw">
              Estimate your payout
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          <div data-reveal="mask" className="relative">
            <Parallax className="aspect-[5/6] bg-media sm:aspect-[4/3] lg:aspect-[5/6]" amount={12}>
              <Image src={editorial.closet.src} alt={editorial.closet.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </Parallax>
          </div>
          <div
            className="theme-dark absolute -bottom-8 left-4 right-4 border border-line p-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] sm:left-auto sm:right-8 sm:w-[19rem] lg:-left-12 lg:right-auto"
            data-reveal
            style={{ ["--reveal-delay" as string]: "250ms" }}
          >
            <p className="mono text-muted">Payout estimate</p>
            <p className="mt-3 text-sm">Hermès Kelly 28 Sellier</p>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-xs text-muted">Sale price</span>
              <span className="tabular text-sm">{formatPrice(EXAMPLE_PRICE)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-muted">You receive</span>
              <span className="price text-2xl">{formatPrice(payout)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
