"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ScanSearch } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Seal } from "@/components/ui/seal";

const ZOOM = 2.8;

/**
 * The specialist's report, told against the photograph: the image stays put
 * while each check scrolls past, and a loupe glides to the detail it describes.
 * Hovering the photograph turns the loupe into a free magnifier.
 */
export function AuthenticationReport({ product, brandName }: { product: Product; brandName: string }) {
  const hotspots = product.hotspots ?? [];
  const studio = product.images[0];
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [free, setFree] = useState<{ x: number; y: number } | null>(null);
  const auth = product.authentication;

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Each check activates its hotspot as it crosses the middle of the viewport
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-report-step]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.reportStep));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!hotspots.length || !studio?.studio) return null;

  const point = free ?? hotspots[active];
  const loupe = Math.max(120, size.w * 0.36);
  const bgW = size.w * ZOOM;
  const bgH = size.h * ZOOM;
  const largeSrc = studio.src.replace(/\.webp$/, "-1440.webp");

  return (
    <section aria-labelledby="report-title" className="border-t border-line">
      <div className="container-x grid grid-cols-1 gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        {/* Photograph with hotspots and loupe */}
        <div className="lg:col-span-6">
          <div className="sticky top-[calc(var(--sticky-top)+1.5rem)] transition-[top] duration-500">
            <div
              ref={frame}
              className="relative aspect-[4/5] cursor-crosshair select-none overflow-hidden bg-media"
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                const r = e.currentTarget.getBoundingClientRect();
                setFree({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
              }}
              onPointerLeave={() => setFree(null)}
            >
              <Image src={studio.src} alt={studio.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" placeholder="blur" blurDataURL={studio.blur} className="object-cover" />

              {hotspots.map((h, i) => (
                <button
                  key={h.title}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    document.querySelector(`[data-report-step="${i}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
                  }}
                  aria-label={`${i + 1}. ${h.title}`}
                  className={cn(
                    "mono absolute z-10 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[10px] backdrop-blur-sm transition-[background-color,color,border-color,transform] duration-300",
                    i === active && !free ? "scale-110 border-ink bg-ink text-ivory" : "border-ink/40 bg-paper/80 text-ink hover:border-ink",
                  )}
                  style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
                >
                  {i + 1}
                </button>
              ))}

              {size.w > 0 ? (
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute z-20 rounded-full border border-ink/70 shadow-[0_18px_50px_-12px_rgb(0_0_0/0.45)] ring-[6px] ring-paper/70",
                    free ? "transition-none" : "transition-[left,top,background-position] duration-700 ease-out",
                  )}
                  style={{
                    width: loupe,
                    height: loupe,
                    left: point.x * size.w - loupe / 2,
                    top: point.y * size.h - loupe / 2 - (free ? 0 : loupe * 0.62),
                    backgroundImage: `url(${largeSrc})`,
                    backgroundSize: `${bgW}px ${bgH}px`,
                    backgroundPosition: `${-(point.x * bgW - loupe / 2)}px ${-(point.y * bgH - loupe / 2)}px`,
                    backgroundColor: "var(--media)",
                  }}
                />
              ) : null}
            </div>
            <p className="mono mt-3 flex items-center gap-2 text-subtle">
              <ScanSearch className="h-3.5 w-3.5" strokeWidth={1.5} />
              Hover the photograph to inspect it yourself
            </p>
          </div>
        </div>

        {/* The report */}
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="flex items-start justify-between gap-6 border-b border-line pb-8">
            <div>
              <p className="mono text-muted">Authentication report · {auth.certificateId}</p>
              <h2 id="report-title" className="display-sm mt-4">
                What our specialist <em>checked.</em>
              </h2>
              <p className="mt-4 text-sm text-muted">
                {auth.status === "authenticated" ? (
                  <>
                    {brandName} specialist {auth.authenticator} · {auth.authenticatedOn ? formatDate(auth.authenticatedOn) : ""}
                  </>
                ) : (
                  "In progress at the Becho Hub"
                )}
              </p>
            </div>
            <Seal className="w-20 shrink-0 text-accent" spin={false} />
          </div>

          <ol>
            {hotspots.map((h, i) => (
              <li
                key={h.title}
                data-report-step={i}
                className={cn(
                  "flex min-h-[36svh] gap-6 border-b border-line py-10 transition-opacity duration-500 lg:min-h-[42svh]",
                  i === active ? "opacity-100" : "opacity-35",
                )}
              >
                <span className="font-display text-5xl leading-none">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-2xl">{h.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{h.note}</p>
                  <p className="mono mt-5 flex items-center gap-2 text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Passed
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {auth.checks.map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
