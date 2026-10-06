import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { getBrandName, productDisplayName } from "@/lib/data/brands";
import { formatPrice } from "@/lib/format";
import { Parallax } from "@/components/motion/parallax";
import { Eyebrow } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { SplitReveal } from "@/components/motion/split-reveal";

/** Investment pieces — the Vault — with how far each trades above retail. */
export function VaultSpotlight({ hero, pieces }: { hero: Product; pieces: Product[] }) {
  const editorialShot = hero.images.find((i) => !i.studio) ?? hero.images[0];
  return (
    <section aria-labelledby="vault-title" className="theme-dark relative py-24 sm:py-32">
      <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        <Link
          href={`/product/${hero.slug}`}
          data-cursor="View"
          className="group relative block lg:col-span-6"
          aria-label={productDisplayName(hero)}
        >
          <Parallax className="aspect-[4/5] bg-media" amount={14}>
            <Image src={editorialShot.src} alt={editorialShot.alt} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
          </Parallax>
          <div className="absolute left-5 top-5 flex items-center gap-2">
            <span className="mono bg-ivory px-2 py-1 text-[10px] text-ink">The Vault</span>
          </div>
          <div className="mt-5 flex items-baseline justify-between gap-6">
            <div>
              <p className="label">{getBrandName(hero.brand)}</p>
              <p className="mt-1 text-sm text-muted">{hero.name}</p>
            </div>
            <p className="tabular text-sm">{formatPrice(hero.price)}</p>
          </div>
        </Link>

        <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-8">
          <Eyebrow index="07">The Vault</Eyebrow>
          <SplitReveal id="vault-title" className="display-lg mt-6">
            Pieces that outlive <em>trends.</em>
          </SplitReveal>
          <p className="lede mt-6 max-w-md text-muted" data-reveal>
            Some things are bought to be worn and kept. Discontinued references and waitlist leather goods — verified,
            documented, and often trading above their boutique price.
          </p>

          <ul className="mt-12 border-t border-line">
            {pieces.map((p) => {
              const multiple = p.retailPrice ? p.price / p.retailPrice : null;
              return (
                <li key={p.id} className="border-b border-line" data-reveal>
                  <Link href={`/product/${p.slug}`} className="group flex items-center gap-5 py-5">
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-media">
                      <Image src={p.images[0].src} alt="" fill sizes="64px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="label block">{getBrandName(p.brand)}</span>
                      <span className="mt-1 block truncate text-sm text-muted">{p.name}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1.5">
                      <span className="tabular text-sm">{formatPrice(p.price)}</span>
                      {multiple && multiple > 1 ? (
                        <span className="mono text-[var(--c-seal-bright)]">{multiple.toFixed(1)}× retail</span>
                      ) : (
                        <span className="mono text-subtle">Discontinued</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-10">
            <ButtonLink href="/explore?min=1000000&sort=price-desc" variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
              Enter the Vault
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
