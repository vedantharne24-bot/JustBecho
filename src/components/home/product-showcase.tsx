"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { useFinePointer } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ShowcaseMobile } from "./product-showcase-mobile";

export interface ShowcasePiece {
  slug: string;
  brand: string;
  name: string;
  category: string;
  price: string;
  certificate: string;
  word: string;
  tint: string;
  cutout: { src: string; aspect: number };
  callouts: { x: number; y: number; title: string; note: string }[];
}

type Callout = ShowcasePiece["callouts"][number];

/**
 * Sends each note to the nearer side, keeps the sides balanced, and spaces
 * labels vertically so they never collide — like leader lines on a drawing.
 */
function layoutCallouts(callouts: Callout[], aspect: number) {
  // Wide pieces sit in a short frame, so spacing (in frame units) grows with the
  // aspect ratio and labels may extend above and below the frame.
  const wide = Math.max(1, aspect);
  const MIN_GAP = 0.17 * wide;
  const LO = 0.08 - (wide - 1) * 0.35;
  const HI = 0.92 + (wide - 1) * 0.35;
  const items = callouts.map((c, k) => ({ ...c, k, side: (c.x < 0.5 ? "left" : "right") as "left" | "right", ly: c.y }));
  // Balance: never more than two notes on one side
  for (const side of ["left", "right"] as const) {
    const onSide = items.filter((i) => i.side === side);
    if (onSide.length > 2) {
      const move = onSide.sort((a, b) => Math.abs(a.x - 0.5) - Math.abs(b.x - 0.5))[0];
      move.side = side === "left" ? "right" : "left";
    }
  }
  for (const side of ["left", "right"] as const) {
    const col = items.filter((i) => i.side === side).sort((a, b) => a.y - b.y);
    col.forEach((item, idx) => {
      item.ly = idx === 0 ? Math.max(LO, item.y) : Math.max(item.y, col[idx - 1].ly + MIN_GAP);
    });
    const overflow = col.length ? col[col.length - 1].ly - HI : 0;
    if (overflow > 0) col.forEach((item) => (item.ly -= overflow));
  }
  return items;
}

/**
 * "Under the loupe" — the signature product scroll. The stage pins; each
 * piece rises into a pool of light, turns slightly as you scroll, and the
 * specialist's notes draw out from the details they describe. Then it lifts
 * away and the next piece takes the light. The brand's name drifts behind.
 */
export function ProductShowcase({ pieces }: { pieces: ShowcasePiece[] }) {
  const root = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const fine = useFinePointer();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const n = pieces.length;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * n * 1.05}`,
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => {
              const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999));
              setActive((prev) => (prev === i ? prev : i));
              if (progress.current) progress.current.style.transform = `scaleY(${self.progress})`;
            },
          },
        });
        trigger.current = tl.scrollTrigger ?? null;

        pieces.forEach((_, i) => {
          const piece = `[data-sc-piece="${i}"]`;
          const media = `${piece} [data-sc-media]`;
          const callouts = gsap.utils.toArray<HTMLElement>(`${piece} [data-sc-callout]`);
          const word = `[data-sc-word="${i}"]`;
          const bg = `[data-sc-bg="${i}"]`;
          const info = `[data-sc-info="${i}"]`;

          // Backdrop and word
          if (i > 0) tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.inOut" }, i - 0.12);
          tl.fromTo(word, { xPercent: 28 }, { xPercent: -28, duration: 1.25 }, i - 0.2);
          if (i > 0) tl.fromTo(word, { opacity: 0 }, { opacity: 1, duration: 0.2 }, i - 0.12);

          // Entrance
          if (i > 0) {
            tl.fromTo(
              media,
              { yPercent: 38, scale: 0.78, rotate: -9, opacity: 0 },
              { yPercent: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.32, ease: "power3.out" },
              i - 0.06,
            ).fromTo(info, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, i + 0.06);
          }
          // Drift while held — vertical only, so the notes stay level and legible
          tl.to(media, { yPercent: -3, scale: 1.02, duration: 0.5 }, i + 0.26);
          // Notes draw out from their details
          callouts.forEach((c) => {
            const k = Number(c.dataset.scCallout);
            const at = i + 0.3 + k * 0.1;
            const leader = root.current!.querySelector<SVGElement>(`${piece} [data-sc-leader="${k}"]`)!;
            tl.fromTo(c.querySelector("[data-sc-dot]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.06, ease: "back.out(2)" }, at)
              .fromTo(leader, { clipPath: leader.dataset.from }, { clipPath: leader.dataset.to, duration: 0.1, ease: "power2.out" }, at + 0.03)
              .fromTo(c.querySelector("[data-sc-label]"), { opacity: 0, x: c.dataset.side === "left" ? 12 : -12 }, { opacity: 1, x: 0, duration: 0.08 }, at + 0.09);
          });
          // Exit (the last piece stays)
          if (i < n - 1) {
            tl.to([...callouts, `${piece} [data-sc-leader]`], { opacity: 0, duration: 0.08 }, i + 0.8)
              .to(media, { yPercent: -34, scale: 0.86, rotate: 9, opacity: 0, duration: 0.26, ease: "power2.in" }, i + 0.8)
              .to(info, { opacity: 0, y: -20, duration: 0.14 }, i + 0.84)
              .to(word, { opacity: 0, duration: 0.18 }, i + 0.9);
          }
        });
        tl.to({}, { duration: 0.15 }, n - 0.05);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [pieces.length] },
  );

  const onPointerMove = (e: React.PointerEvent) => {
    if (!fine || !tilt.current) return;
    const r = tilt.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.transform = `perspective(1400px) rotateY(${px * 10}deg) rotateX(${-py * 7}deg) translate3d(${px * 14}px, ${py * 10}px, 0)`;
  };
  const resetTilt = () => {
    if (tilt.current) tilt.current.style.transform = "perspective(1400px) rotateY(0deg) rotateX(0deg)";
  };

  const jumpTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const target = st.start + ((st.end - st.start) * (i + 0.3)) / pieces.length;
    scrollToTarget(target);
  };

  return (
    <section ref={root} aria-labelledby="showcase-title" className="theme-dark relative overflow-x-clip">
      {/* ── Desktop: pinned stage ─────────────────────────────────────── */}
      <div className="relative hidden h-[100svh] min-h-[700px] lg:block lg:motion-reduce:hidden" onPointerMove={onPointerMove} onPointerLeave={resetTilt}>
        {pieces.map((p, i) => (
          <div
            key={p.slug}
            data-sc-bg={i}
            aria-hidden
            className="absolute inset-0"
            style={{
              opacity: i === 0 ? 1 : 0,
              background: `radial-gradient(60% 55% at 50% 52%, color-mix(in oklab, ${p.tint} 55%, #3a352d) 0%, ${p.tint} 55%, #070706 100%)`,
            }}
          />
        ))}

        {pieces.map((p, i) => (
          <p
            key={p.slug}
            data-sc-word={i}
            aria-hidden
            className="font-display pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap italic leading-none text-ivory/[0.07]"
            style={{ fontSize: "clamp(9rem, 21vw, 26rem)", opacity: i === 0 ? 1 : 0, paddingLeft: "6vw" }}
          >
            {p.word}
          </p>
        ))}

        {/* Header */}
        <div className="container-x pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2rem)] z-20 flex items-start justify-between">
          <div>
            <p className="mono flex items-center gap-3 text-muted">
              <span className="text-fg">01</span>
              <span className="h-px w-8 bg-line-strong" />
              Under the loupe
            </p>
            <h2 id="showcase-title" className="display-sm mt-4 max-w-sm">
              Four pieces, <em>inspected.</em>
            </h2>
          </div>
          <p className="max-w-[16rem] text-right text-xs leading-relaxed text-muted">
            Every note below was written by the specialist who authenticated the piece.
          </p>
        </div>

        {/* Stage */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div ref={tilt} className="relative h-[60svh] w-[60svh] transition-transform duration-700 ease-out will-change-transform" style={{ transform: "perspective(1400px)" }}>
            <div aria-hidden className="absolute left-1/2 top-[86%] h-[9%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
            {pieces.map((p, i) => (
              <div key={p.slug} data-sc-piece={i} className="absolute inset-0" aria-hidden={i !== active}>
                <Link
                  href={`/product/${p.slug}`}
                  tabIndex={i === active ? 0 : -1}
                  data-cursor="View piece"
                  aria-label={`View ${p.brand} ${p.name}`}
                  data-sc-media
                  className="absolute inset-0 flex items-center justify-center will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <span className="relative block max-h-full max-w-full" style={{ aspectRatio: p.cutout.aspect, height: p.cutout.aspect >= 1 ? "auto" : "100%", width: p.cutout.aspect >= 1 ? "100%" : "auto" }}>
                    <Image
                      src={p.cutout.src}
                      alt=""
                      fill
                      sizes="60vh"
                      className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
                    />
                    {/* Leader lines: from each detail out to a label column beside the piece.
                        Each runs one way horizontally, so it "draws" with a clip wipe —
                        dash offsets are unreliable with non-scaling strokes. */}
                    {layoutCallouts(p.callouts, p.cutout.aspect).map((c) => {
                      const x = c.x * 100;
                      const left = c.side === "left";
                      const elbow = left ? -6 : 106;
                      const edge = left ? -14 : 114;
                      const from = left ? `inset(-60% ${98 - x}% -60% ${x}%)` : `inset(-60% ${100 - x}% -60% ${x - 2}%)`;
                      const to = left ? `inset(-60% ${98 - x}% -60% -16%)` : `inset(-60% -16% -60% ${x - 2}%)`;
                      return (
                        <svg
                          key={c.title}
                          aria-hidden
                          data-sc-leader={c.k}
                          data-from={from}
                          data-to={to}
                          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                          style={{ clipPath: from }}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <path
                            d={`M ${x} ${c.y * 100} L ${elbow} ${c.ly * 100} L ${edge} ${c.ly * 100}`}
                            fill="none"
                            stroke="rgb(245 242 235 / 0.55)"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      );
                    })}
                    {layoutCallouts(p.callouts, p.cutout.aspect).map((c) => (
                      <span key={c.title} data-sc-callout={c.k} data-side={c.side}>
                        <span
                          data-sc-dot
                          className="absolute grid h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/80 bg-ink/40 opacity-0 backdrop-blur-sm"
                          style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
                        >
                          <span className="h-1 w-1 rounded-full bg-[var(--c-seal-bright)]" />
                        </span>
                        <span
                          data-sc-label
                          className={cn("absolute w-[13.5rem] -translate-y-1/2 opacity-0", c.side === "left" ? "text-right" : "")}
                          style={{
                            top: `${c.ly * 100}%`,
                            ...(c.side === "left" ? { right: "calc(114% + 10px)" } : { left: "calc(114% + 10px)" }),
                          }}
                        >
                          <span className="mono block text-ivory/50">{String(c.k + 1).padStart(2, "0")}</span>
                          <span className="mt-1 block text-sm text-ivory">{c.title}</span>
                          <span className="mt-1 block text-xs leading-snug text-ivory/60">{c.note}</span>
                        </span>
                      </span>
                    ))}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Piece details */}
        <div className="container-x absolute inset-x-0 bottom-[6svh] z-20 flex items-end justify-between">
          <div className="relative h-36 w-[26rem]">
            {pieces.map((p, i) => (
              <div key={p.slug} data-sc-info={i} className="absolute bottom-0 left-0" style={{ opacity: i === 0 ? 1 : 0 }} aria-hidden={i !== active}>
                <p className="mono text-muted">
                  N° {String(i + 1).padStart(2, "0")} · {p.category}
                </p>
                <p className="label mt-3">{p.brand}</p>
                <p className="font-display mt-1 text-3xl">{p.name}</p>
                <div className="mt-4 flex items-center gap-6">
                  <span className="price text-lg">{p.price}</span>
                  <Link
                    href={`/product/${p.slug}`}
                    tabIndex={i === active ? 0 : -1}
                    className="label group inline-flex items-center gap-2"
                  >
                    <span className="link-draw">View the piece</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <nav aria-label="Showcase pieces" className="flex items-stretch gap-5">
            <div aria-hidden className="relative w-px bg-line">
              <div ref={progress} className="absolute inset-x-0 top-0 h-full origin-top bg-fg" style={{ transform: "scaleY(0)" }} />
            </div>
            <ol className="flex flex-col gap-2">
              {pieces.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={cn("mono flex items-center gap-3 transition-colors", i === active ? "text-fg" : "text-subtle hover:text-muted")}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span className="normal-case tracking-normal">{p.brand}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Phones and tablets: the same story on a sticky stage ───────── */}
      <ShowcaseMobile pieces={pieces} />

      {/* ── Reduced motion, any size: stacked ─────────────────────────── */}
      <div className="container-x hidden py-24 motion-reduce:block">
        <p className="mono flex items-center gap-3 text-muted">
          <span className="text-fg">01</span>
          <span className="h-px w-8 bg-line-strong" />
          Under the loupe
        </p>
        <h2 className="display-md mt-5">
          Four pieces, <em>inspected.</em>
        </h2>
        <ol className="mt-12 flex flex-col gap-14">
          {pieces.map((p) => (
            <li key={p.slug}>
              <Link href={`/product/${p.slug}`} className="block">
                <div
                  data-reveal="mask"
                  className="relative aspect-square overflow-hidden"
                  style={{ background: `radial-gradient(70% 60% at 50% 50%, color-mix(in oklab, ${p.tint} 55%, #3a352d) 0%, ${p.tint} 60%, #070706 100%)` }}
                >
                  <div className="reveal-media absolute inset-[12%]">
                    <Image src={p.cutout.src} alt={`${p.brand} ${p.name}`} fill sizes="80vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]" />
                  </div>
                  {p.callouts.map((c, k) => {
                    // The cut-out is letterboxed inside the 76% square, so place
                    // dots on the image's own box rather than the square.
                    const w = 76 * Math.min(1, p.cutout.aspect);
                    const h = 76 / Math.max(1, p.cutout.aspect);
                    return (
                      <span
                        key={c.title}
                        aria-hidden
                        className="mono absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/70 bg-ink/50 text-[9px] text-ivory backdrop-blur-sm"
                        style={{ left: `${50 - w / 2 + c.x * w}%`, top: `${50 - h / 2 + c.y * h}%` }}
                      >
                        {k + 1}
                      </span>
                    );
                  })}
                </div>
              </Link>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <div>
                  <p className="label">{p.brand}</p>
                  <p className="font-display mt-1 text-2xl">{p.name}</p>
                </div>
                <p className="price text-base">{p.price}</p>
              </div>
              <ol className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                {p.callouts.map((c, k) => (
                  <li key={c.title} className="flex gap-3 text-xs">
                    <span className="mono text-subtle">{String(k + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="text-fg">{c.title}</span> <span className="text-muted">— {c.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
