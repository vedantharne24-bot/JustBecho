"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { useReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Every angle of a piece in one frame: sweep the pointer (or drag, or use the
 * arrow keys) across the photograph to move between views. On first sight it
 * plays through once so the interaction is discoverable.
 */
export function AngleScrubber({ images, title }: { images: ProductImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Preview the sequence once when it first comes into view
  useEffect(() => {
    if (reduced) return;
    const el = frame.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || timer) return;
        let i = 0;
        timer = setInterval(() => {
          i += 1;
          if (i >= images.length) {
            if (timer) clearInterval(timer);
            setIndex(0);
            return;
          }
          setIndex(i);
        }, 650);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [images.length, reduced]);

  const fromPointer = (clientX: number) => {
    const r = frame.current!.getBoundingClientRect();
    const t = Math.min(0.999, Math.max(0, (clientX - r.left) / r.width));
    setIndex(Math.floor(t * images.length));
  };

  return (
    <section aria-label="Every angle" className="border-t border-line">
      <div className="container-x grid grid-cols-1 items-center gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="mono text-muted">Every angle</p>
          <h2 className="display-sm mt-4">
            Turn it over <em>in your hands.</em>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Photographed by the seller and checked against the piece at the Becho Hub. Sweep across the photograph to move
            between views.
          </p>
          <p className="mono mt-8 flex items-center gap-2 text-subtle">
            <MoveHorizontal className="h-4 w-4" strokeWidth={1.25} />
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <div
            ref={frame}
            role="slider"
            tabIndex={0}
            aria-label={`${title}: view ${index + 1} of ${images.length}`}
            aria-valuemin={1}
            aria-valuemax={images.length}
            aria-valuenow={index + 1}
            aria-valuetext={images[index].alt}
            data-cursor="Sweep"
            onPointerMove={(e) => {
              if (e.pointerType === "mouse" || e.buttons) {
                setTouched(true);
                fromPointer(e.clientX);
              }
            }}
            onPointerDown={(e) => {
              setTouched(true);
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              fromPointer(e.clientX);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setIndex((i) => Math.min(images.length - 1, i + 1));
              if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
            }}
            className="relative aspect-[4/5] cursor-ew-resize touch-pan-y select-none overflow-hidden bg-media sm:aspect-[5/4]"
          >
            {images.map((img, i) => (
              <Image
                key={img.src + i}
                src={img.src}
                alt={i === index ? img.alt : ""}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                placeholder={img.blur ? "blur" : "empty"}
                blurDataURL={img.blur}
                className={cn("object-cover transition-opacity duration-300", i === index ? "opacity-100" : "opacity-0")}
                draggable={false}
              />
            ))}
            {!touched ? (
              <span className="mono pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-paper/85 px-3 py-1.5 text-[10px] text-ink backdrop-blur">
                <MoveHorizontal className="h-3 w-3" strokeWidth={1.5} /> Sweep to turn
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {images.map((img, i) => (
              <button
                key={img.src + i}
                type="button"
                tabIndex={-1}
                onClick={() => setIndex(i)}
                className="group relative h-8 flex-1"
              >
                <span className={cn("absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-colors", i === index ? "bg-fg" : "bg-line-strong group-hover:bg-muted")} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
