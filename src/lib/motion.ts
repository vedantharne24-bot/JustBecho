/**
 * Motion language
 *
 *   fast      ~200ms   hover, press, toggles
 *   base      ~420ms   panels, drawers, menus
 *   slow      ~900ms   section reveals and image masks
 *
 * One family of curves: an expressive expo-out for entrances, a symmetric
 * in-out for state changes, nothing linear except marquees and progress.
 */

export const duration = {
  fast: 0.2,
  base: 0.42,
  slow: 0.9,
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  soft: [0.25, 1, 0.5, 1] as const,
};

export const transition = {
  fast: { duration: duration.fast, ease: ease.out },
  base: { duration: duration.base, ease: ease.out },
  slow: { duration: duration.slow, ease: ease.out },
  inOut: { duration: duration.base, ease: ease.inOut },
};

/** Variants reused by overlays and lists */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: transition.base },
  exit: { opacity: 0, y: 8, transition: transition.fast },
};

export const stagger = (step = 0.05, delay = 0) => ({
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});
