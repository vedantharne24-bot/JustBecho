"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import type { ShowcasePiece } from "./product-showcase";

/** Scroll given to each piece, in screen heights */
const PER_PIECE = 1.5;
/** Notes shown per piece — three fit a phone without crowding */
const NOTES = 3;

/**
 * "Under the loupe" for phones. The stage sticks (CSS sticky, so touch scrolling
 * stays native and smooth) while each piece rises into its pool of light; its
 * details light up one at a time, each drawing a line down to the specialist's
 * note. Then the piece lifts away and the next takes its place.
 */
export function ShowcaseMobile({ pieces }: { pieces: ShowcasePiece[] }) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const n = pieces.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate: (self) => {
              const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999));
              setActive((prev) => (prev === i ? prev : i));
            },
          },
        });
        trigger.current = tl.scrollTrigger ?? null;

        pieces.forEach((p, i) => {
          const sel = (name: string) => `[data-m-${name}="${i}"]`;
          const notes = p.callouts.slice(0, NOTES);

          // Backdrop, brand word and progress
          if (i > 0) {
            tl.fromTo(sel("bg"), { opacity: 0 }, { opacity: 1, duration: 0.18 }, i - 0.1);
            tl.fromTo(sel("word"), { opacity: 0 }, { opacity: 1, duration: 0.18 }, i - 0.08);
          }
          tl.fromTo(sel("word"), { xPercent: 12 }, { xPercent: -46, duration: 1.15 }, i - 0.1);
          tl.fromTo(sel("bar"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, i);

          // Entrance
          if (i > 0) {
            tl.fromTo(
              sel("media"),
              { yPercent: 34, scale: 0.8, rotate: -7, opacity: 0 },
              { yPercent: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.24, ease: "power3.out" },
              i - 0.04,
            ).fromTo(sel("info"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, i + 0.06);
          }
          tl.to(sel("media"), { yPercent: -3, scale: 1.03, duration: 0.62 }, i + 0.2);

          // Each detail lights up and draws down to its note; the last stays lit
          notes.forEach((_, k) => {
            const at = i + 0.2 + k * 0.21;
            const dot = `${sel("piece")} [data-m-dot="${k}"]`;
            const line = `${sel("piece")} [data-m-line="${k}"]`;
            const note = `${sel("notes")} [data-m-note="${k}"]`;
            tl.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.05, ease: "back.out(2.4)" }, at)
              .fromTo(line, { scaleY: 0, opacity: 1 }, { scaleY: 1, duration: 0.08, ease: "power2.out" }, at + 0.02)
              .fromTo(note, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" }, at + 0.05);
            if (k > 0) {
              const prev = k - 1;
              tl.to(`${sel("notes")} [data-m-note="${prev}"]`, { opacity: 0, y: -10, duration: 0.05 }, at)
                .to(`${sel("piece")} [data-m-line="${prev}"]`, { opacity: 0, duration: 0.05 }, at)
                .to(`${sel("piece")} [data-m-dot="${prev}"]`, { opacity: 0.55, duration: 0.05 }, at);
            }
          });

          // Exit (the last piece stays)
          if (i < n - 1) {
            tl.to([`${sel("piece")} [data-m-dot]`, `${sel("piece")} [data-m-line]`, `${sel("notes")} [data-m-note]`], { opacity: 0, duration: 0.06 }, i + 0.86)
              .to(sel("media"), { yPercent: -30, scale: 0.86, rotate: 7, opacity: 0, duration: 0.2, ease: "power2.in" }, i + 0.86)
              .to(sel("info"), { opacity: 0, y: -12, duration: 0.1 }, i + 0.88)
              .to(sel("word"), { opacity: 0, duration: 0.14 }, i + 0.9);
          }
        });
        tl.to({}, { duration: 0.1 }, n - 0.1);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [n] },
  );

  const jumpTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    scrollToTarget(st.start + ((st.end - st.start) * (i + 0.55)) / n);
  };

  return (
    <div ref={root} className="relative lg:hidden motion-reduce:hidden" style={{ height: `${100 + n * PER_PIECE * 100}svh` }}>
      <div className="sticky top-0 h-[100svh] min-h-[600px] overflow-hidden">
        {pieces.map((p, i) => (
          <div
            key={p.slug}
            data-m-bg={i}
            aria-hidden
            className="absolute inset-0"
            style={{
              opacity: i === 0 ? 1 : 0,
              background: `radial-gradient(80% 50% at 50% 40%, color-mix(in oklab, ${p.tint} 55%, #3a352d) 0%, ${p.tint} 58%, #070706 100%)`,
            }}
          />
        ))}

        {pieces.map((p, i) => (
          <p
            key={p.slug}
            data-m-word={i}
            aria-hidden
            className="font-display pointer-events-none absolute left-0 top-[27svh] whitespace-nowrap pl-[8vw] italic leading-none text-ivory/[0.07]"
            style={{ fontSize: "34vw", opacity: i === 0 ? 1 : 0 }}
          >
            {p.word}
          </p>
        ))}

        {/* Heading and progress */}
        <div className="container-x absolute inset-x-0 top-[calc(var(--header-h)+0.75rem)] z-20">
          <div className="flex items-baseline justify-between">
            <p className="mono flex items-center gap-3 text-muted">
              <span className="text-fg">01</span>
              <span className="h-px w-6 bg-line-strong" />
              Under the loupe
            </p>
            <p className="mono tabular text-muted" aria-live="polite">
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
          </div>
          <p className="font-display mt-2 text-[1.625rem] leading-tight">
            Four pieces, <em>inspected.</em>
          </p>
          <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {pieces.map((p, i) => (
              <button key={p.slug} type="button" onClick={() => jumpTo(i)} aria-label={`Show ${p.brand} ${p.name}`} className="py-2">
                <span className="block h-px overflow-hidden bg-ivory/20">
                  <span data-m-bar={i} className="block h-full origin-left bg-ivory" style={{ transform: "scaleX(0)" }} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* The pieces, centred in a size container so dots and lines can be laid out in its units */}
        <div className="absolute inset-x-[var(--gutter)] top-[25svh] z-10 h-[36svh] [container-type:size]">
          {pieces.map((p, i) => (
            <div key={p.slug} data-m-piece={i} className="absolute inset-0 grid place-items-center" aria-hidden={i !== active}>
              <Link
                href={`/product/${p.slug}`}
                tabIndex={i === active ? 0 : -1}
                aria-label={`View ${p.brand} ${p.name}`}
                data-m-media={i}
                className="relative block will-change-transform"
                style={
                  {
                    "--a": p.cutout.aspect,
                    width: "min(100cqw, calc(100cqh * var(--a)))",
                    height: "min(100cqh, calc(100cqw / var(--a)))",
                    opacity: i === 0 ? 1 : 0,
                  } as CSSProperties
                }
              >
                <Image src={p.cutout.src} alt="" fill sizes="90vw" className="object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)]" />
                {p.callouts.slice(0, NOTES).map((c, k) => (
                  <span key={c.title}>
                    {/* From the detail straight down to where its note appears */}
                    <span
                      data-m-line={k}
                      aria-hidden
                      className="absolute w-px origin-top bg-gradient-to-b from-ivory/80 to-ivory/30"
                      style={{
                        left: `${c.x * 100}%`,
                        top: `${c.y * 100}%`,
                        height: `calc(${1 - c.y} * min(100cqh, 100cqw / var(--a)) + (100cqh - min(100cqh, 100cqw / var(--a))) / 2 + 3.5svh)`,
                        transform: "scaleY(0)",
                      }}
                    />
                    <span
                      data-m-dot={k}
                      aria-hidden
                      className="mono absolute grid h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/80 bg-ink/45 text-[10px] text-ivory opacity-0 backdrop-blur-sm"
                      style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
                    >
                      {k + 1}
                    </span>
                  </span>
                ))}
              </Link>
            </div>
          ))}
        </div>

        {/* The specialist's notes, one at a time */}
        <div className="absolute inset-x-[var(--gutter)] top-[64.5svh] z-20 h-[5.75rem]">
          {pieces.map((p, i) => (
            <ol key={p.slug} data-m-notes={i} className="absolute inset-x-0 top-0" aria-hidden={i !== active}>
              {p.callouts.slice(0, NOTES).map((c, k) => (
                <li key={c.title} data-m-note={k} className="absolute inset-x-0 top-0 opacity-0">
                  <p className="flex items-baseline gap-2.5">
                    <span className="mono text-[var(--c-seal-bright)]">{String(k + 1).padStart(2, "0")}</span>
                    <span className="text-[0.9375rem] text-ivory">{c.title}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-ivory/65">{c.note}</p>
                </li>
              ))}
            </ol>
          ))}
        </div>

        {/* Piece details */}
        <div className="absolute inset-x-[var(--gutter)] bottom-[max(1.25rem,3svh)] z-20 h-[6.5rem]">
          {pieces.map((p, i) => (
            <div
              key={p.slug}
              data-m-info={i}
              className="absolute inset-x-0 bottom-0 border-t border-line pt-4"
              style={{ opacity: i === 0 ? 1 : 0 }}
              aria-hidden={i !== active}
            >
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="mono text-muted">
                    N° {String(i + 1).padStart(2, "0")} · {p.category}
                  </p>
                  <p className="label mt-2">{p.brand}</p>
                  <p className="font-display mt-0.5 truncate text-[1.375rem] leading-tight">{p.name}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="price text-base">{p.price}</span>
                  <Link
                    href={`/product/${p.slug}`}
                    tabIndex={i === active ? 0 : -1}
                    className="label inline-flex items-center gap-1.5"
                  >
                    View
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.25} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
