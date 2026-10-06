import type { Brand } from "@/lib/types";

export const brands: Brand[] = [
  { slug: "hermes", name: "Hermès", origin: "Paris", founded: "1837", blurb: "Saddle-makers turned the most coveted name in leather goods. Kelly and Birkin bags are hand-stitched by a single artisan." },
  { slug: "chanel", name: "Chanel", origin: "Paris", founded: "1910", blurb: "Quilted lambskin, interlocking Cs and the chain strap Gabrielle Chanel borrowed from soldiers' bags in 1955." },
  { slug: "louis-vuitton", name: "Louis Vuitton", origin: "Paris", founded: "1854", blurb: "A trunk-maker's monogram that became fashion's most recognised canvas." },
  { slug: "dior", name: "Dior", origin: "Paris", founded: "1946", blurb: "The New Look house. Cannage quilting echoes the Napoleon III chairs of Christian Dior's first salon." },
  { slug: "gucci", name: "Gucci", origin: "Florence", founded: "1921", blurb: "Florentine leather, the Horsebit and the Web stripe — equestrian codes worn by Hollywood since the sixties." },
  { slug: "saint-laurent", name: "Saint Laurent", origin: "Paris", founded: "1961", blurb: "Razor tailoring and the Cassandre monogram, cast in gold-tone hardware." },
  { slug: "prada", name: "Prada", origin: "Milan", founded: "1913", blurb: "Milanese intellect: the Re-Nylon, the enamel triangle and the Cahier's book-binding clasp." },
  { slug: "valentino", name: "Valentino Garavani", origin: "Rome", founded: "1960", blurb: "Roman couture known for the pyramid Rockstud." },
  { slug: "rolex", name: "Rolex", origin: "Geneva", founded: "1905", blurb: "The benchmark of the pre-owned watch market. Oyster cases, in-house movements, waiting lists measured in years." },
  { slug: "omega", name: "Omega", origin: "Biel/Bienne", founded: "1848", blurb: "The first watch worn on the Moon, and the Seamaster's wave dial." },
  { slug: "cartier", name: "Cartier", origin: "Paris", founded: "1847", blurb: "Jeweller to kings. The Santos was designed for an aviator in 1904; the Tank, after the First World War." },
  { slug: "patek-philippe", name: "Patek Philippe", origin: "Geneva", founded: "1839", blurb: "Independent, family-owned and the summit of haute horlogerie. The Nautilus defined the luxury sports watch." },
  { slug: "audemars-piguet", name: "Audemars Piguet", origin: "Le Brassus", founded: "1875", blurb: "Gérald Genta's octagonal Royal Oak, with its Grande Tapisserie dial, is an icon of the form." },
  { slug: "breitling", name: "Breitling", origin: "Grenchen", founded: "1884", blurb: "Instruments for professionals. The Navitimer's slide-rule bezel has been in production since 1952." },
  { slug: "jordan", name: "Jordan", origin: "Beaverton", founded: "1985", blurb: "The silhouette that built sneaker culture. The 1985 Air Jordan 1 remains its most traded shoe." },
  { slug: "nike", name: "Nike", origin: "Beaverton", founded: "1964", blurb: "From the Dunk's college colourways to the skate-ready SB line." },
  { slug: "yeezy", name: "Adidas Yeezy", origin: "Herzogenaurach", founded: "2015", blurb: "Primeknit uppers on full-length Boost — the 350 V2 reshaped what a sneaker could be." },
  { slug: "off-white", name: "Off-White", origin: "Milan", founded: "2012", blurb: "Virgil Abloh's quotation marks, zip-ties and deconstructed classics." },
  { slug: "balenciaga", name: "Balenciaga", origin: "Paris", founded: "1917", blurb: "Exaggerated proportions and logo play, from the Triple S to campaign hoodies." },
  { slug: "supreme", name: "Supreme", origin: "New York", founded: "1994", blurb: "The red box logo, weekly drops and collaborations with the houses it once parodied." },
  { slug: "fear-of-god", name: "Fear of God", origin: "Los Angeles", founded: "2013", blurb: "Jerry Lorenzo's elevated American basics; Essentials is its everyday line." },
  { slug: "vlone", name: "Vlone", origin: "New York", founded: "2011", blurb: "A$AP Bari's orange-V streetwear label." },
  { slug: "burberry", name: "Burberry", origin: "London", founded: "1856", blurb: "Inventors of gabardine and of the trench coat worn in the trenches." },
  { slug: "max-mara", name: "Max Mara", origin: "Reggio Emilia", founded: "1951", blurb: "The definitive coat. The 101801 has been cut from the same pattern since 1981." },
  { slug: "brunello-cucinelli", name: "Brunello Cucinelli", origin: "Solomeo", founded: "1978", blurb: "Umbrian cashmere from a hamlet the founder restored for his artisans." },
  { slug: "santoni", name: "Santoni", origin: "Corridonia", founded: "1975", blurb: "Hand-burnished Italian shoemaking; each pair is coloured by hand." },
  { slug: "christian-louboutin", name: "Christian Louboutin", origin: "Paris", founded: "1991", blurb: "The red lacquered sole, and the spikes that made loafers loud." },
  { slug: "bottega-veneta", name: "Bottega Veneta", origin: "Vicenza", founded: "1966", blurb: "Intrecciato weaving and the quiet confidence of no logo at all." },
  { slug: "tiffany", name: "Tiffany & Co.", origin: "New York", founded: "1837", blurb: "The blue box. Its Lock collection reinterprets a padlock as fine jewellery." },
];

export const brandMap: Record<string, Brand> = Object.fromEntries(
  brands.map((b) => [b.slug, b]),
);

export function getBrandName(slug: string): string {
  return brandMap[slug]?.name ?? slug;
}

/** Full display name without repeating the house ("Jordan" + "Air Jordan 1…") */
export function productDisplayName(product: { brand: string; name: string }): string {
  const brand = getBrandName(product.brand);
  const norm = (t: string) =>
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  return norm(product.name).includes(norm(brand)) ? product.name : `${brand} ${product.name}`;
}
