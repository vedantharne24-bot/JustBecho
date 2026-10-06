"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ease } from "@/lib/motion";
import { Eyebrow } from "@/components/ui/misc";

const VOICES = [
  {
    quote: "The Kelly arrived sealed, with a certificate and a note on a corner I’d never have spotted. That honesty is why I keep buying here.",
    name: "Meher K.",
    city: "Mumbai",
    role: "Buyer · Hermès Kelly 25",
  },
  {
    quote: "I sold three watches in a month. They handled the photography, the buyer questions, the courier — I just shipped a box.",
    name: "Siddharth R.",
    city: "New Delhi",
    role: "Seller · 11 pieces sold",
  },
  {
    quote: "Seeing the authentication timeline update — received, inspected, sealed — made a ₹4 lakh sneaker purchase feel completely calm.",
    name: "Tara V.",
    city: "Bengaluru",
    role: "Buyer · Off-White × Jordan 1",
  },
];

export function Voices() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const voice = VOICES[index];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % VOICES.length), 7000);
    return () => clearInterval(id);
  }, [paused]);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + VOICES.length) % VOICES.length);

  return (
    <section
      aria-labelledby="voices-title"
      aria-roledescription="carousel"
      className="container-x py-24 sm:py-32"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Eyebrow>As told by our clients</Eyebrow>
          <h2 id="voices-title" className="sr-only">
            Client stories
          </h2>
          <p className="font-display mt-8 text-[5rem] leading-none text-fg/15" aria-hidden>
            “
          </p>
        </div>
        <div className="min-h-[18rem] lg:col-span-8 lg:col-start-5" aria-live="polite">
          <AnimatePresence mode="wait">
            <m.figure
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: ease.out } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
            >
              <blockquote className="display-sm max-w-3xl leading-[1.18]">
                <p>{voice.quote}</p>
              </blockquote>
              <figcaption className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="text-sm">
                  {voice.name}, {voice.city}
                </span>
                <span className="mono text-muted">{voice.role}</span>
              </figcaption>
            </m.figure>
          </AnimatePresence>
          <div className="mt-12 flex items-center gap-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous story"
                className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-fg"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next story"
                className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-fg"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
              </button>
            </div>
            <p className="mono tabular text-muted">
              {String(index + 1).padStart(2, "0")} / {String(VOICES.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
