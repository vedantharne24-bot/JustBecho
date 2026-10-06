"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PROTECT_STAGES } from "@/lib/data/protect";
import { Eyebrow } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

/**
 * The Becho Protect journey, told as a pinned sequence on desktop: the
 * page holds while each stage of authentication takes the frame in turn.
 * On phones the stages are a deck of cards — each slides up over the last,
 * which settles back as it's covered.
 */
export function ProtectStory({
  index = "03",
  showLink = true,
  id,
}: {
  index?: string;
  showLink?: boolean;
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const stages = PROTECT_STAGES;
  const stage = stages[active];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-protect-card]");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          // As the next card slides up to its resting place, this one settles back
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: next,
                start: "top bottom",
                end: () => `top ${parseFloat(getComputedStyle(next).top) || 80}px`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            .to(card.querySelector("[data-protect-inner]"), { scale: 0.9 }, 0)
            .to(card.querySelector("[data-protect-dim]"), { opacity: 0.6 }, 0);
        });
      });
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * stages.length * 0.62}`,
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              const next = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
              setActive((prev) => (prev === next ? prev : next));
              if (rail.current) rail.current.style.transform = `scaleY(${self.progress})`;
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id={id} aria-labelledby="protect-story-title" className="theme-dark relative overflow-x-clip">
      {/* Desktop — pinned stage */}
      <div className="container-x hidden h-[100svh] min-h-[720px] grid-cols-12 items-center gap-10 lg:grid">
        <div className="col-span-5 flex h-full flex-col justify-center py-[calc(var(--header-h)+2rem)]">
          <Eyebrow index={index}>Becho Protect</Eyebrow>
          <h2 id="protect-story-title" className="display-md mt-6">
            Six checkpoints between
            <br />
            the seller and <em>you.</em>
          </h2>

          <ol className="relative mt-12 flex flex-col">
            <div aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-line">
              <div ref={rail} className="h-full w-full origin-top bg-fg" style={{ transform: "scaleY(0)" }} />
            </div>
            {stages.map((s, i) => (
              <li key={s.key} className="relative flex items-center gap-6 py-2.5 pl-8">
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full border transition-colors duration-500",
                    i <= active ? "border-fg bg-fg" : "border-line-strong bg-bg",
                    i === active && "ring-4 ring-fg/10",
                  )}
                />
                <span className={cn("mono w-6 transition-colors duration-500", i === active ? "text-fg" : "text-subtle")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-sm transition-[color,transform] duration-500 ease-out",
                    i === active ? "translate-x-1 text-fg" : i < active ? "text-muted" : "text-subtle",
                  )}
                  aria-current={i === active ? "step" : undefined}
                >
                  {s.short}
                </span>
              </li>
            ))}
          </ol>

          {showLink ? (
            <Link href="/protect" className="label group mt-12 inline-flex items-center gap-3 self-start">
              <span className="link-draw">How Becho Protect works</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
            </Link>
          ) : null}
        </div>

        <div className="relative col-span-7 h-[74svh] max-h-[820px]">
          <div className="relative h-full overflow-hidden bg-media">
            {stages.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "absolute inset-0 transition-[clip-path] duration-[1100ms] ease-in-out",
                  i === active ? "z-10 [clip-path:inset(0_0_0_0)]" : i < active ? "z-0 [clip-path:inset(0_0_0_0)]" : "z-0 [clip-path:inset(100%_0_0_0)]",
                )}
              >
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  sizes="58vw"
                  className={cn("object-cover transition-transform duration-[1800ms] ease-out", i === active ? "scale-100" : "scale-110")}
                />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 z-10 h-[70%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-7 gap-8 p-8 xl:p-10">
              <p
                key={`n-${active}`}
                className="font-display col-span-2 text-[7rem] leading-[0.8] text-ivory [animation:stage-in_900ms_var(--ease-out)_both] xl:text-[9rem]"
              >
                {String(active + 1).padStart(2, "0")}
              </p>
              <div key={`t-${active}`} className="col-span-5 self-end [animation:stage-in_900ms_var(--ease-out)_80ms_both]">
                <p className="mono text-ivory/60">{stage.duration}</p>
                <h3 className="font-display mt-2 text-[2rem] leading-tight text-ivory">{stage.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/75">{stage.description}</p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {stage.details.map((d) => (
                    <li key={d} className="mono flex items-center gap-1.5 text-ivory/80">
                      <Check className="h-3 w-3 text-[var(--c-seal-bright)]" strokeWidth={2} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phones & tablets — a deck of cards, each sliding over the last */}
      <div className="container-x py-24 lg:hidden">
        <Eyebrow index={index}>Becho Protect</Eyebrow>
        <h2 className="display-md mt-6">
          Six checkpoints between the seller and <em>you.</em>
        </h2>
        <ol className="mt-12 flex flex-col gap-[12svh] motion-reduce:gap-10">
          {stages.map((s, i) => (
            <li
              key={s.key}
              data-protect-card
              className="motion-safe:sticky sm:mx-auto sm:w-full sm:max-w-xl"
              style={{ top: `calc(var(--header-h) + 1rem + ${i * 0.625}rem)` }}
            >
              <div data-protect-inner className="relative origin-top overflow-hidden border border-line bg-surface shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.8)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-media">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 640px) 36rem, 100vw" className="object-cover" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <span className="font-display absolute bottom-3 left-4 text-[3.5rem] leading-none text-ivory">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mono absolute bottom-4 right-4 text-ivory/75">{s.duration}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[1.625rem] leading-tight">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {s.details.map((d) => (
                      <li key={d} className="mono flex items-center gap-2 text-fg/80">
                        <Check className="h-3 w-3 text-accent" strokeWidth={2} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div data-protect-dim aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />
              </div>
            </li>
          ))}
        </ol>
        {showLink ? (
          <Link href="/protect" className="label group mt-14 inline-flex items-center gap-3">
            <span className="link-draw">How Becho Protect works</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
