import type { ProductImage } from "@/lib/types";
import { editorial, photo } from "@/lib/images";

export interface Edit {
  slug: string;
  title: string;
  titleItalic: string;
  kicker: string;
  dek: string;
  intro: string[];
  quote: { text: string; by: string };
  hero: ProductImage;
  tint: string;
  products: string[];
}

export const EDITS: Edit[] = [
  {
    slug: "the-wedding-edit",
    title: "The Wedding",
    titleItalic: "Edit",
    kicker: "Season of celebrations",
    dek: "From the mehendi to the reception — pieces with presence, verified before the first invitation arrives.",
    intro: [
      "Indian weddings are marathons of dressing. A Kelly in Rouge Casaque carries through a sangeet and a sundowner without changing its mind; a Clash de Cartier stacks as easily against a sari as against a sleeve.",
      "We built this edit around pieces that photograph well, travel well and keep their value well after the last baraat — each one authenticated and sealed at the Becho Hub.",
    ],
    quote: { text: "Buy the piece you’ll still want when the photographs are old.", by: "Meera Iyer, leather goods specialist" },
    hero: photo("1621735588289-30f4d7c6f31a", "A red Hermès Kelly suspended in a boutique window", { tone: "dark" }),
    tint: "#2a0f0c",
    products: [
      "hermes-kelly-25-sellier-rouge-casaque",
      "clash-de-cartier-bracelet-rose-gold",
      "tiffany-lock-bangle-yellow-gold-diamonds",
      "chanel-classic-double-flap-medium-black",
      "rolex-datejust-41-chocolate-diamond",
      "christian-louboutin-dandelion-spikes-loafer",
      "santoni-horsebit-loafer-cognac",
      "brunello-cucinelli-cashmere-overcoat-camel",
    ],
  },
  {
    slug: "diwali-gifting",
    title: "Gifts that",
    titleItalic: "keep",
    kicker: "Diwali gifting",
    dek: "The kind of present that’s opened once and kept for decades — sealed, boxed and ready to give.",
    intro: [
      "A good gift outlives the occasion. These are pieces with a story already in them: a Tank designed after the First World War, a carré printed from a maritime archive, a fragrance that has been in production since 1921.",
      "Every gift ships in our archival box with the Becho Protect seal intact, so whoever opens it knows exactly what they’re holding.",
    ],
    quote: { text: "The seal is the first thing they’ll see. It tells them the rest.", by: "Client care, Mumbai" },
    hero: editorial.sealedBox,
    tint: "#1b1813",
    products: [
      "cartier-tank-must-large",
      "hermes-carre-90-chaine-dancre-violet",
      "louis-vuitton-pochette-metis-monogram",
      "gucci-gg-marmont-small-matelasse-black",
      "chanel-n5-eau-de-parfum-100ml",
      "bleu-de-chanel-eau-de-parfum-100ml",
      "cartier-santos-aviator-sunglasses",
      "gucci-logo-belt-bag-web",
    ],
  },
  {
    slug: "the-first-watch",
    title: "The First",
    titleItalic: "Watch",
    kicker: "Starting a collection",
    dek: "Where serious collections begin: references with history, movements you can service for life, and resale you can count on.",
    intro: [
      "Most collectors remember their first serious watch more clearly than their tenth. It should be something you can wear every day, service anywhere and, if you ever choose, sell without losing sleep.",
      "Each watch here was opened by our watchmaker, timed on the bench and cross-checked against its papers before it was listed.",
    ],
    quote: { text: "Start with a reference people will still recognise in thirty years.", by: "Arjun Malhotra, watch specialist" },
    hero: editorial.wristDaytona,
    tint: "#0b0f17",
    products: [
      "rolex-submariner-date-126610ln",
      "omega-speedmaster-moonwatch-professional",
      "cartier-santos-de-cartier-medium",
      "rolex-submariner-date-126613lb-bluesy",
      "breitling-navitimer-b01-chronograph-43",
      "omega-seamaster-diver-300m-blue",
      "cartier-tank-must-large",
      "rolex-datejust-41-chocolate-diamond",
    ],
  },
  {
    slug: "off-duty",
    title: "Off",
    titleItalic: "Duty",
    kicker: "Streetwear & grails",
    dek: "The drops you refreshed for and missed — now authenticated, boxed and finally in your size.",
    intro: [
      "Streetwear’s most-copied pieces are the ones that need us most. Every pair here passed UV inspection, stitch counts and a box-label match; every garment had its tags and print density checked.",
      "Wear them hard. That’s what they were made for.",
    ],
    quote: { text: "If it sold out in a minute, it’s been faked in an hour. We check everything.", by: "Sana Qureshi, sneaker specialist" },
    hero: editorial.sneakerPair,
    tint: "#120d0a",
    products: [
      "off-white-air-jordan-1-chicago-the-ten",
      "air-jordan-1-retro-high-og-taxi",
      "nike-sb-dunk-low-orange-mint",
      "supreme-script-varsity-jacket-black",
      "balenciaga-soccer-t-shirt-oversized",
      "air-jordan-1-retro-high-og-lost-and-found",
      "adidas-yeezy-boost-350-v2-onyx",
      "louis-vuitton-x-supreme-keepall-bandouliere-45-red",
    ],
  },
];

export const editBySlug: Record<string, Edit> = Object.fromEntries(EDITS.map((e) => [e.slug, e]));
