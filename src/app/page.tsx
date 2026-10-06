import { PageShell } from "@/components/layout/page-shell";
import { Hero, type HeroSlide } from "@/components/home/hero";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { JustInRail } from "@/components/home/just-in-rail";
import { CategoryIndex } from "@/components/home/category-index";
import { ProtectStory } from "@/components/protect/protect-story";
import { BudgetTiles } from "@/components/home/budget-tiles";
import { VaultSpotlight } from "@/components/home/vault-spotlight";
import { SellCta } from "@/components/home/sell-cta";
import { Voices } from "@/components/home/voices";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/misc";
import { ProductShowcase, type ShowcasePiece } from "@/components/home/product-showcase";
import { HomeEdits, HomeJournal } from "@/components/home/home-editorial";
import { getArticles, getEdits } from "@/lib/api/editorial";
import { STUDIO } from "@/lib/data/studio";
import { categoryMap } from "@/lib/data/categories";
import { formatPrice } from "@/lib/format";
import { clamp } from "@/lib/utils";
import { getAllProducts, getCategories, getMostWanted, getNewArrivals, getProduct } from "@/lib/api/catalog";
import { getBrandName } from "@/lib/data/brands";
import { exploreHref } from "@/lib/catalog";

/** The showcase: piece, the word that drifts behind it, and its backdrop tint */
const SHOWCASE = [
  { slug: "hermes-kelly-28-sellier-bleu-paon", word: "Hermès", tint: "#0d1a19" },
  { slug: "patek-philippe-nautilus-5711-1a-blue", word: "Patek Philippe", tint: "#0a0e17" },
  { slug: "off-white-air-jordan-1-chicago-the-ten", word: "Off-White", tint: "#1b0d0b" },
  { slug: "rolex-submariner-date-126613lb-bluesy", word: "Rolex", tint: "#0b1121" },
];

const HERO_SLUGS = [
  "hermes-kelly-28-sellier-bleu-paon",
  "patek-philippe-nautilus-5711-1a-blue",
  "air-jordan-1-retro-high-og-taxi",
  "chanel-classic-double-flap-medium-black",
];

export default async function HomePage() {
  const [all, categories, newArrivals, mostWanted, edits, articles] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getNewArrivals(8),
    getMostWanted(8),
    getEdits(),
    getArticles(),
  ]);

  // Hotspots are placed on the studio frame; re-express them on the cut-out
  const showcase: ShowcasePiece[] = (await Promise.all(SHOWCASE.map((s) => getProduct(s.slug))))
    .map((p, i) => ({ p, meta: SHOWCASE[i] }))
    .filter(({ p }) => p?.cutout && STUDIO[p.slug])
    .map(({ p, meta }) => {
      const box = STUDIO[p!.slug].box;
      return {
        slug: p!.slug,
        brand: getBrandName(p!.brand),
        name: p!.name,
        category: categoryMap[p!.category].name,
        price: formatPrice(p!.price),
        certificate: p!.authentication.certificateId,
        word: meta.word,
        tint: meta.tint,
        cutout: p!.cutout!,
        callouts: (p!.hotspots ?? []).slice(0, 3).map((h) => ({
          x: clamp((h.x - box.x) / box.w, 0.06, 0.94),
          y: clamp((h.y - box.y) / box.h, 0.06, 0.94),
          title: h.title,
          note: h.note,
        })),
      };
    });

  const heroProducts = await Promise.all(HERO_SLUGS.map((s) => getProduct(s)));
  const slides: HeroSlide[] = heroProducts
    .filter((p) => p !== null)
    .map((p) => ({
      // The hero uses the editorial photograph rather than the studio shot
      src: (p.images.find((i) => !i.studio) ?? p.images[0]).src,
      alt: (p.images.find((i) => !i.studio) ?? p.images[0]).alt,
      brand: getBrandName(p.brand),
      name: p.name,
      certificate: p.authentication.certificateId,
      href: `/product/${p.slug}`,
    }));

  const live = all.filter((p) => p.status !== "sold");
  const lastWeek = live.filter((p) => new Date(p.listedAt) >= new Date("2026-09-29")).length;

  const vaultHero = (await getProduct("patek-philippe-nautilus-5711-1a-blue"))!;
  const vaultPieces = (
    await Promise.all(
      ["audemars-piguet-royal-oak-15400or", "hermes-kelly-25-sellier-rouge-casaque", "off-white-air-jordan-1-chicago-the-ten"].map(getProduct),
    )
  ).filter((p) => p !== null);

  const budget = [
    { label: "Under ₹25,000", figure: "₹25K", caption: "Sneakers, streetwear, fragrance", min: 0, max: 25000 },
    { label: "₹25,000 – ₹1 lakh", figure: "₹1L", caption: "Loafers, Marmonts, eyewear", min: 25000, max: 100000 },
    { label: "₹1 lakh – ₹10 lakh", figure: "₹10L", caption: "Icons from Dior, Cartier, Omega", min: 100000, max: 1000000 },
    { label: "The Vault", figure: "₹10L+", caption: "Hermès, Patek Philippe, Rolex", min: 1000000, max: undefined },
  ].map((b) => ({
    label: b.label,
    figure: b.figure,
    caption: b.caption,
    count: live.filter((p) => p.price >= b.min && (b.max == null || p.price <= b.max)).length,
    href: exploreHref({ minPrice: b.min || undefined, maxPrice: b.max, sort: b.min >= 1000000 ? "price-desc" : undefined }),
  }));

  return (
    <PageShell bleed>
      <Hero slides={slides} />
      <BrandMarquee />
      <ProductShowcase pieces={showcase} />
      <CategoryIndex
        categories={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          tagline: c.tagline,
          description: c.description,
          count: c.count,
          image: { src: c.image.src, alt: c.image.alt },
        }))}
      />
      <JustInRail products={newArrivals} total={lastWeek} />
      <ProtectStory index="04" />
      <HomeEdits edits={edits} />
      <BudgetTiles tiles={budget} />
      <section aria-labelledby="wanted-title" className="container-x pb-24 sm:pb-32">
        <SectionHeader
          eyebrow="Most wanted"
          title={
            <span id="wanted-title">
              Saved most <em>this week.</em>
            </span>
          }
          href="/explore?sort=most-saved"
        />
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-4">
          {mostWanted.map((p, i) => (
            <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
      <VaultSpotlight hero={vaultHero} pieces={vaultPieces} />
      <SellCta />
      <HomeJournal articles={articles} />
      <Voices />
    </PageShell>
  );
}
