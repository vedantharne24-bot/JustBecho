import type { ProductImage } from "@/lib/types";
import { editorial, photo } from "@/lib/images";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; by?: string }
  | { type: "list"; items: string[] }
  | { type: "image"; image: ProductImage; caption: string }
  | { type: "products"; slugs: string[]; title: string };

export interface Article {
  slug: string;
  title: string;
  titleItalic?: string;
  dek: string;
  category: "Authentication" | "Investment" | "Care" | "Culture";
  author: string;
  role: string;
  date: string;
  readTime: number;
  hero: ProductImage;
  body: Block[];
}

export const ARTICLES: Article[] = [
  {
    slug: "anatomy-of-a-kelly",
    title: "Anatomy of a",
    titleItalic: "Kelly",
    dek: "Two constructions, one artisan, and the small marks that separate a real Kelly from a very good copy.",
    category: "Authentication",
    author: "Meera Iyer",
    role: "Leather goods specialist",
    date: "2026-09-24",
    readTime: 6,
    hero: editorial.hermesHorse,
    body: [
      { type: "p", text: "The Kelly began life as a saddle-bag and became a legend when Grace Kelly used one to shield herself from photographers. The house renamed it in her honour, and it has been made more or less the same way ever since: by hand, by one person, from start to finish." },
      { type: "h2", text: "Sellier or Retourne" },
      { type: "p", text: "A Sellier Kelly is stitched on the outside, giving it sharp edges and a rigid, architectural stance. A Retourne is stitched inside out and turned, so its seams are hidden and the bag slumps gently with use. Neither is better — but each has its own tells, and we check them differently." },
      { type: "quote", text: "The stitch is a signature. Every artisan’s hand leans a little, and that lean is consistent across the whole bag.", by: "Meera Iyer" },
      { type: "h2", text: "What we look at first" },
      {
        type: "list",
        items: [
          "The saddle stitch: linen thread, waxed, slightly angled and even across every panel.",
          "The blind stamp: a letter in a shape that dates the bag, positioned and struck exactly as the year requires.",
          "Hardware: engraving depth, weight in the hand and the screws that hold the turn-lock.",
          "The clochette and key: numbers that match, and leather that has aged with the bag.",
        ],
      },
      { type: "image", image: photo("1652427019217-3ded1a356f10", "A Kelly 28 Sellier in Bleu Paon"), caption: "Kelly 28 Sellier, Bleu Paon — authenticated at the Becho Hub." },
      { type: "p", text: "A convincing counterfeit can get most of these right. It almost never gets all of them right at once. That’s why every Kelly on JustBecho is examined panel by panel, under magnification, against a reference library of bags we know to be genuine." },
      { type: "products", title: "Kellys in the Vault", slugs: ["hermes-kelly-28-sellier-bleu-paon", "hermes-kelly-25-sellier-rouge-casaque"] },
    ],
  },
  {
    slug: "how-we-authenticate-a-jordan-1",
    title: "How we authenticate a",
    titleItalic: "Jordan 1",
    dek: "UV light, stitch counts and a box label: inside the sneaker bench at the Becho Hub.",
    category: "Authentication",
    author: "Sana Qureshi",
    role: "Sneaker & streetwear specialist",
    date: "2026-09-10",
    readTime: 5,
    hero: editorial.sneakerPair,
    body: [
      { type: "p", text: "The Air Jordan 1 has been reissued more times than any shoe we see, which makes it the most counterfeited too. Our process is the same for a ₹12,000 pair as it is for a pair of ‘The Ten’ — because the fakes don’t care about price." },
      { type: "h2", text: "Under ultraviolet" },
      { type: "p", text: "The first check happens in the dark. Under UV light, factory glue, stitching and midsole paint react in ways that are hard to fake. Stray glue lines, mismatched thread and reglued soles show up immediately." },
      { type: "h2", text: "Counting stitches" },
      { type: "p", text: "Stitch density around the toe box and the swoosh is consistent on genuine pairs, and both shoes match each other. We count, measure the curve of the swoosh and check the depth of the Wings logo deboss." },
      { type: "quote", text: "The box tells you as much as the shoe. The label, the SKU and the size tag inside should all tell the same story.", by: "Sana Qureshi" },
      {
        type: "list",
        items: [
          "Box label, SKU and colourway match the release.",
          "Size tag production dates are consistent with the box.",
          "Insole, outsole moulding and heel shape match a retail reference pair.",
        ],
      },
      { type: "products", title: "Authenticated this month", slugs: ["off-white-air-jordan-1-chicago-the-ten", "air-jordan-1-retro-high-og-lost-and-found", "air-jordan-1-retro-high-og-taxi", "air-jordan-1-low-se-navy-suede"] },
    ],
  },
  {
    slug: "is-a-daytona-still-an-investment",
    title: "Is a Daytona still an",
    titleItalic: "investment?",
    dek: "Waiting lists, references and full sets — what actually decides whether a watch holds its value.",
    category: "Investment",
    author: "Arjun Malhotra",
    role: "Watch specialist",
    date: "2026-08-28",
    readTime: 7,
    hero: editorial.wristDaytona,
    body: [
      { type: "p", text: "The Cosmograph Daytona has been in production since 1963, and for most of that time it was not especially sought after. Today it is one of the most requested watches in the world. That journey is a useful reminder: demand changes, but a few fundamentals don’t." },
      { type: "h2", text: "Reference matters more than model" },
      { type: "p", text: "Two watches can share a name and trade at very different prices. Dial colour, material, bezel and production year all move value. The current steel Daytona with a white dial and the Everose model on a bracelet sit in different markets with different buyers." },
      { type: "h2", text: "The full set" },
      { type: "p", text: "Box, warranty card, hang tags and service papers are not decoration. For high-value references, a complete, matching set can be the difference between a quick sale and a long negotiation." },
      { type: "quote", text: "Buy the best example you can afford, with its papers. Condition and completeness compound over time.", by: "Arjun Malhotra" },
      { type: "h2", text: "Our view" },
      { type: "p", text: "No watch is a guaranteed investment. But a well-kept example of a historically important reference, documented and serviced, has always been a sensible place to keep value — and a pleasure to wear while it does." },
      { type: "products", title: "From the Vault", slugs: ["rolex-cosmograph-daytona-126500ln-white", "rolex-cosmograph-daytona-116505-everose", "patek-philippe-nautilus-5711-1a-blue", "audemars-piguet-royal-oak-15400or"] },
    ],
  },
  {
    slug: "caring-for-leather-thats-lived",
    title: "Caring for leather",
    titleItalic: "that’s lived",
    dek: "Monsoon humidity, dust and sunlight: a practical guide to keeping a pre-owned bag at its best.",
    category: "Care",
    author: "Kiara Shah",
    role: "JustBecho seller, Bengaluru",
    date: "2026-08-12",
    readTime: 4,
    hero: editorial.closet,
    body: [
      { type: "p", text: "Leather is skin, and it behaves like it. In an Indian monsoon it can absorb enough moisture to mark, mould or lose its shape. A little routine goes a long way." },
      { type: "h2", text: "Store it breathing" },
      {
        type: "list",
        items: [
          "Keep bags in their cotton dust bags — never in plastic, which traps moisture.",
          "Stuff them lightly with acid-free tissue to hold their shape.",
          "Add silica gel sachets to the cupboard during the monsoon, and replace them monthly.",
          "Stand bags upright with handles relaxed; never hang them by the strap for long periods.",
        ],
      },
      { type: "h2", text: "Clean less, gently" },
      { type: "p", text: "Most bags need little more than a soft, dry cloth. Condition sparingly — once or twice a year — with a product suited to the leather, and always test on a hidden spot first. Vachetta and suede are better left to a specialist." },
      { type: "quote", text: "Patina is a story. Damage is a different one. The difference is how the bag was stored.", by: "Kiara Shah" },
      { type: "image", image: editorial.atelier, caption: "A holdall at rest — upright, stuffed, out of direct sun." },
      { type: "products", title: "Pieces that age beautifully", slugs: ["louis-vuitton-speedy-bandouliere-25-monogram", "louis-vuitton-pochette-metis-monogram", "gucci-gg-marmont-small-matelasse-black"] },
    ],
  },
];

export const articleBySlug: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
