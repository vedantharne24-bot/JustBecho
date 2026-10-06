import type { Condition } from "@/lib/types";

export const CONDITIONS: { value: Condition; label: string; short: string; description: string; grade: number }[] = [
  {
    value: "new-with-tags",
    label: "New with tags",
    short: "New",
    description: "Unworn, with original tags, packaging and all accessories.",
    grade: 6,
  },
  {
    value: "new-without-tags",
    label: "New, no tags",
    short: "New",
    description: "Unworn or tried on once. Tags or some packaging may be missing.",
    grade: 5,
  },
  {
    value: "like-new",
    label: "Like new",
    short: "Like new",
    description: "Worn a handful of times. No visible signs of wear on close inspection.",
    grade: 4,
  },
  {
    value: "excellent",
    label: "Excellent",
    short: "Excellent",
    description: "Gently used. Minor marks only visible under close inspection.",
    grade: 3,
  },
  {
    value: "very-good",
    label: "Very good",
    short: "Very good",
    description: "Visible signs of wear such as light scuffs, patina or creasing. Fully functional.",
    grade: 2,
  },
  {
    value: "good",
    label: "Good",
    short: "Good",
    description: "Noticeable wear, described and photographed in detail. Priced accordingly.",
    grade: 1,
  },
];

export const conditionMap = Object.fromEntries(CONDITIONS.map((c) => [c.value, c])) as Record<
  Condition,
  (typeof CONDITIONS)[number]
>;
