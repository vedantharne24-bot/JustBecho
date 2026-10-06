"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { SmoothScroll } from "./smooth-scroll";
import { StoreHydrator } from "./store-hydrator";
import { RevealObserver } from "./reveal-observer";
import { Cursor } from "./cursor";
import { Toaster } from "@/components/ui/toaster";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        <StoreHydrator />
        <SmoothScroll />
        <RevealObserver />
        {children}
        <Toaster />
        <Cursor />
      </LazyMotion>
    </MotionConfig>
  );
}
