import type { Category, CategorySlug } from "@/lib/types";
import { editorial, photo } from "@/lib/images";

export const categories: Category[] = [
  {
    slug: "bags",
    name: "Bags",
    tagline: "Kelly to Cahier",
    description: "Top-handles, shoulder bags and travel pieces from the houses that define leather goods — each one checked stitch by stitch.",
    image: editorial.bagHands,
    subcategories: ["Top-handle", "Shoulder", "Crossbody", "Bowling", "Travel"],
  },
  {
    slug: "watches",
    name: "Watches",
    tagline: "Serial-verified",
    description: "Sports icons and dress classics with movements opened, serials cross-referenced and service history documented.",
    image: editorial.wristDaytona,
    subcategories: ["Sports", "Chronograph", "Dress", "Diver"],
  },
  {
    slug: "sneakers",
    name: "Sneakers",
    tagline: "Deadstock & grails",
    description: "Retros, collaborations and grails — UV-light checked, stitch-counted and boxed exactly as they left the factory.",
    image: editorial.sneakerPair,
    subcategories: ["High-top", "Low-top", "Runner"],
  },
  {
    slug: "streetwear",
    name: "Streetwear",
    tagline: "Drops that sold out",
    description: "Box logos, campaign hoodies and collaborations that never stayed on the shelf for more than a minute.",
    image: editorial.supremeBW,
    subcategories: ["Hoodies", "Outerwear", "Tops", "Luggage"],
  },
  {
    slug: "ready-to-wear",
    name: "Ready-to-Wear",
    tagline: "Coats, loafers, boots",
    description: "Investment outerwear and Italian shoemaking — the pieces a wardrobe is built around.",
    image: editorial.heroCoat,
    subcategories: ["Coats", "Loafers", "Boots"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "Gold, silk & glass",
    description: "Fine jewellery, silk carrés, eyewear and sealed fragrance — the finishing details, verified.",
    image: photo("1655707063513-a08dad26440e", "A gold bangle set with a line of diamonds resting on white silk", { tone: "light" }),
    subcategories: ["Jewellery", "Scarves", "Eyewear", "Fragrance", "Belt bags"],
  },
];

export const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<
  CategorySlug,
  Category
>;

export function isCategorySlug(value: string): value is CategorySlug {
  return value in categoryMap;
}
