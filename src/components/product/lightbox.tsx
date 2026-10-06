"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type View = { s: number; x: number; y: number };
const MAX = 4;
const TAP_ZOOM = 2.5;
const identity: View = { s: 1, x: 0, y: 0 };

/**
 * Full-screen viewer.
 * Mouse: click to zoom at the pointer, move to pan, click again to reset.
 * Touch: pinch to zoom, drag to pan, double-tap to zoom in or out, swipe to page.
 * Keyboard: arrow keys page, +/− zoom, Escape closes.
 */
export function Lightbox({
  images,
  index,
  open,
  onOpenChange,
  onIndexChange,
  title,
}: {
  images: ProductImage[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  title: string;
}) {
  const [view, setView] = useState<View>(identity);
  const [gesturing, setGesturing] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; s: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);

  const zoomed = view.s > 1.01;

  const clampView = useCallback((v: View): View => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return v;
    const s = Math.min(MAX, Math.max(1, v.s));
    const maxX = ((s - 1) * rect.width) / 2;
    const maxY = ((s - 1) * rect.height) / 2;
    return { s, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
  }, []);

  /** Zoom so that the point under (clientX, clientY) stays put */
  const zoomAt = useCallback(
    (clientX: number, clientY: number, s: number) => {
      const rect = frame.current?.getBoundingClientRect();
      if (!rect) return;
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      setView(clampView({ s, x: -px * (s - 1), y: -py * (s - 1) }));
    },
    [clampView],
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      setView(identity);
      onIndexChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "+" || e.key === "=") setView((v) => clampView({ ...v, s: v.s + 0.5 }));
      if (e.key === "-") setView((v) => clampView({ ...v, s: v.s - 0.5 }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, clampView]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      gesture.current = { dist, s: view.s, x: view.x, y: view.y, cx: (pts[0].x + pts[1].x) / 2, cy: (pts[0].y + pts[1].y) / 2, moved: true };
    } else {
      gesture.current = { dist: 0, s: view.s, x: view.x, y: view.y, cx: e.clientX, cy: e.clientY, moved: false };
    }
    setGesturing(e.pointerType !== "mouse");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      // Pointer-follow panning while zoomed
      if (zoomed && !e.buttons) zoomAt(e.clientX, e.clientY, view.s);
      return;
    }
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length === 2 && g.dist) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      setView(clampView({ s: (g.s * dist) / g.dist, x: g.x + (cx - g.cx), y: g.y + (cy - g.cy) }));
    } else if (pts.length === 1) {
      const dx = e.clientX - g.cx;
      const dy = e.clientY - g.cy;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
      if (view.s > 1.01) setView(clampView({ s: view.s, x: g.x + dx, y: g.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    setGesturing(false);
    if (!g) return;
    const dx = e.clientX - g.cx;

    if (e.pointerType === "mouse") {
      if (Math.abs(dx) < 4) {
        if (zoomed) setView(identity);
        else zoomAt(e.clientX, e.clientY, TAP_ZOOM);
      }
      return;
    }
    // Swipe to page when not zoomed
    if (!zoomed && g.moved && Math.abs(dx) > 60) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    // Double-tap
    if (!g.moved) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        if (zoomed) setView(identity);
        else zoomAt(e.clientX, e.clientY, TAP_ZOOM);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
    if (view.s < 1.05) setView(identity);
  };

  const image = images[index];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) setView(identity);
        onOpenChange(o);
      }}
    >
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Content asChild forceMount>
              <m.div
                className="theme-dark fixed inset-0 z-[75] flex flex-col bg-ink outline-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <Dialog.Title className="sr-only">{title} — image viewer</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Arrow keys move between images. Click, double-tap or pinch to zoom.
                </Dialog.Description>
                <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
                  <p className="mono tabular text-muted">
                    {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                    <span className="ml-4 hidden sm:inline">{zoomed ? `${view.s.toFixed(1)}×` : "Click to zoom"}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setView((v) => (v.s > 1.01 ? identity : clampView({ s: TAP_ZOOM, x: 0, y: 0 })))}
                      aria-label={zoomed ? "Zoom out" : "Zoom in"}
                      className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-hover"
                    >
                      {zoomed ? <Minus className="h-4 w-4" strokeWidth={1.25} /> : <Plus className="h-4 w-4" strokeWidth={1.25} />}
                    </button>
                    <Dialog.Close aria-label="Close viewer" className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-hover">
                      <X className="h-5 w-5" strokeWidth={1.25} />
                    </Dialog.Close>
                  </div>
                </div>

                <div className="relative min-h-0 flex-1">
                  <div
                    ref={frame}
                    className={cn(
                      "relative mx-auto h-full max-w-[min(100%,calc((100dvh-9rem)*0.8))] touch-none overflow-hidden",
                      zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
                    )}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <m.div
                        key={image.src}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: ease.out } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      >
                        <div
                          className={cn("absolute inset-0 will-change-transform", !gesturing && "transition-transform duration-300 ease-out")}
                          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})` }}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="100vw"
                            placeholder={image.blur ? "blur" : "empty"}
                            blurDataURL={image.blur}
                            className="object-contain"
                            draggable={false}
                          />
                        </div>
                      </m.div>
                    </AnimatePresence>
                  </div>

                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-ink/40 backdrop-blur transition-colors hover:bg-ink/70 sm:left-6 sm:grid"
                      >
                        <ChevronLeft className="h-5 w-5" strokeWidth={1.25} />
                      </button>
                      <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-ink/40 backdrop-blur transition-colors hover:bg-ink/70 sm:right-6 sm:grid"
                      >
                        <ChevronRight className="h-5 w-5" strokeWidth={1.25} />
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="no-scrollbar flex h-20 shrink-0 items-center justify-center gap-2 overflow-x-auto px-4">
                  {images.map((img, i) => (
                    <button
                      key={img.src + i}
                      type="button"
                      onClick={() => {
                        setView(identity);
                        onIndexChange(i);
                      }}
                      aria-label={`View image ${i + 1}`}
                      aria-current={i === index}
                      className={cn(
                        "relative h-14 w-11 shrink-0 overflow-hidden transition-opacity",
                        i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-ivory" : "opacity-40 hover:opacity-80",
                      )}
                    >
                      <Image src={img.src} alt="" fill sizes="44px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
