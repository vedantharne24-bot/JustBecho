import type { Hotspot } from "@/lib/types";

/**
 * Specialist annotations for the authentication report, positioned on each
 * piece’s studio photograph (0–1 from the top-left of the 4:5 frame).
 */
export const HOTSPOTS: Record<string, Hotspot[]> = {
  "hermes-kelly-28-sellier-bleu-paon": [
    { x: 0.43, y: 0.44, title: "Palladium turn-lock", note: "Engraving depth, screw heads and weight match 2023 production hardware." },
    { x: 0.42, y: 0.21, title: "Rolled handle", note: "Hand-rolled with even edge glazing along its full length." },
    { x: 0.24, y: 0.62, title: "Saddle stitch", note: "Linen thread set at a slight angle — the signature of a single artisan’s hand." },
    { x: 0.73, y: 0.76, title: "Corners", note: "Crisp and unrubbed, consistent with a grade of Like new." },
  ],
  "louis-vuitton-speedy-bandouliere-25-monogram": [
    { x: 0.53, y: 0.43, title: "Zip pull", note: "Brass pull engraved and correctly weighted; zip runs smoothly." },
    { x: 0.75, y: 0.6, title: "Vachetta tab", note: "Heat stamp crisp with correct ‘o’ shapes in Louis Vuitton." },
    { x: 0.45, y: 0.24, title: "Handles", note: "Even honey patina — natural ageing, no dye." },
    { x: 0.3, y: 0.73, title: "Monogram alignment", note: "Pattern symmetric across seams, as on genuine canvas." },
  ],
  "gucci-gg-marmont-small-matelasse-black": [
    { x: 0.53, y: 0.52, title: "Double G", note: "Antique gold finish with the correct interlocking overlap." },
    { x: 0.38, y: 0.62, title: "Chevron quilting", note: "Stitch lines run parallel; the heart motif sits on the reverse." },
    { x: 0.24, y: 0.51, title: "Zip pull", note: "Branded pull with smooth teeth and an even tape." },
    { x: 0.78, y: 0.63, title: "Chain strap", note: "Leather interlaced through the chain, links uniform." },
  ],
  "saint-laurent-envelope-medium-red": [
    { x: 0.556, y: 0.55, title: "Cassandre", note: "YSL monogram with correct letter overlap and fixing." },
    { x: 0.576, y: 0.76, title: "Grain de poudre", note: "Quilting aligned; triangle and chevron panels symmetric." },
    { x: 0.346, y: 0.4, title: "Chain", note: "Gold-tone chain with consistent link size and weight." },
  ],
  "rolex-submariner-date-126613lb-bluesy": [
    { x: 0.63, y: 0.4, title: "Dial and Cyclops", note: "2.5× date magnification; printing crisp under a 10× loupe." },
    { x: 0.56, y: 0.28, title: "Cerachrom bezel", note: "Platinum-coated numerals, 120 clicks, aligned at twelve." },
    { x: 0.65, y: 0.65, title: "Oyster bracelet", note: "Solid links and Oysterlock clasp codes match the reference." },
    { x: 0.26, y: 0.5, title: "Case", note: "Serial and reference engraved between the lugs; case unpolished." },
  ],
  "rolex-cosmograph-daytona-116505-everose": [
    { x: 0.48, y: 0.6, title: "Chronograph registers", note: "Sub-dial printing and hand alignment checked at zero." },
    { x: 0.36, y: 0.55, title: "Tachymeter bezel", note: "Engraved scale on 18 ct Everose, sharp and unworn." },
    { x: 0.5, y: 0.47, title: "Pushers", note: "Screw-down pushers seal correctly; chronograph resets cleanly." },
    { x: 0.78, y: 0.66, title: "Bracelet", note: "Everose links stamped and full length — no links removed." },
  ],
  "omega-speedmaster-moonwatch-professional": [
    { x: 0.38, y: 0.6, title: "Dial", note: "Step dial and hesalite crystal, logo applied — not printed." },
    { x: 0.3, y: 0.52, title: "Tachymeter", note: "Dot over 90 and aluminium insert true to the reference." },
    { x: 0.73, y: 0.64, title: "Bracelet", note: "Brushed links with the correct clasp signature." },
  ],
  "cartier-santos-de-cartier-medium": [
    { x: 0.52, y: 0.55, title: "Dial", note: "Roman numerals with Cartier’s secret signature in the VII." },
    { x: 0.63, y: 0.36, title: "Bezel screws", note: "Eight screws, slots aligned — none replaced." },
    { x: 0.55, y: 0.77, title: "Crown", note: "Faceted crown set with a synthetic spinel cabochon." },
  ],
  "patek-philippe-nautilus-5711-1a-blue": [
    { x: 0.53, y: 0.6, title: "Gradient dial", note: "Horizontal embossing and blue-black gradient, consistent edge to edge." },
    { x: 0.62, y: 0.53, title: "Porthole case", note: "Hinged ears and alternating satin and polished finishes, unpolished." },
    { x: 0.27, y: 0.63, title: "Integrated bracelet", note: "Folding clasp and links match the 5711/1A-010 specification." },
    { x: 0.54, y: 0.77, title: "Crown", note: "Screw-down crown seals; calibre 26-330 S C serial verified." },
  ],
  "audemars-piguet-royal-oak-15400or": [
    { x: 0.55, y: 0.66, title: "Grande Tapisserie", note: "Guilloché pattern sharp and uniform across the dial." },
    { x: 0.46, y: 0.6, title: "Hexagonal screws", note: "Eight white-gold screws, all aligned — a tell-tale of authenticity." },
    { x: 0.79, y: 0.65, title: "Integrated bracelet", note: "Tapering pink-gold links with original finishing." },
  ],
  "off-white-air-jordan-1-chicago-the-ten": [
    { x: 0.4, y: 0.605, title: "‘AIR’ midsole", note: "Hand-style lettering with the correct font weight and placement." },
    { x: 0.62, y: 0.6, title: "Swoosh", note: "Detached swoosh stitched with the signature orange tack." },
    { x: 0.53, y: 0.47, title: "Wings logo", note: "Deboss depth and positioning consistent with 2017 production." },
    { x: 0.37, y: 0.72, title: "Outsole", note: "Clean tread with no sole-swap glue lines under UV." },
  ],
  "air-jordan-1-retro-high-og-taxi": [
    { x: 0.48, y: 0.35, title: "Swoosh", note: "Leather swoosh with straight stitching and correct curve." },
    { x: 0.6, y: 0.26, title: "Wings logo", note: "Sharp deboss on the collar panel." },
    { x: 0.7, y: 0.73, title: "Toe stitching", note: "Stitch density consistent across both shoes." },
    { x: 0.4, y: 0.75, title: "Midsole", note: "Paint lines clean; size tag and box label match the SKU." },
  ],
  "nike-sb-dunk-low-orange-mint": [
    { x: 0.6, y: 0.66, title: "Swoosh", note: "Hairy suede with even nap and clean edges." },
    { x: 0.4, y: 0.63, title: "Fat laces", note: "Original puffy laces, extra pair sealed in the box." },
    { x: 0.83, y: 0.6, title: "Heel tab", note: "Embroidered SB logo with correct thread density." },
    { x: 0.45, y: 0.76, title: "Midsole", note: "Zoom Air insole present; no yellowing." },
  ],
  "hermes-kelly-25-sellier-rouge-casaque": [
    { x: 0.5, y: 0.64, title: "Gold turn-lock", note: "Plating thickness and HERMÈS-PARIS engraving verified under magnification." },
    { x: 0.667, y: 0.71, title: "Clochette and key", note: "Numbered key matches the padlock; clochette stamp aligned." },
    { x: 0.417, y: 0.43, title: "Box calf", note: "Glassy grain with faint marks, disclosed in the condition report." },
    { x: 0.3, y: 0.17, title: "Strap stitching", note: "Stitch count of eight per centimetre, consistent and angled." },
  ],
  "louis-vuitton-pochette-metis-monogram": [
    { x: 0.475, y: 0.31, title: "S-lock", note: "Gold-tone S-lock with clean casting and a firm click." },
    { x: 0.4, y: 0.23, title: "Canvas", note: "Coated canvas without cracking; monogram placement correct." },
    { x: 0.26, y: 0.55, title: "Strap", note: "Leather strap and clasps match the 2021 specification." },
  ],
  "air-jordan-1-retro-high-og-lost-and-found": [
    { x: 0.69, y: 0.45, title: "Cracked collar", note: "Factory-applied crackle, consistent with the 2022 release." },
    { x: 0.635, y: 0.55, title: "Swoosh", note: "Shape, placement and stitching match a retail pair." },
    { x: 0.4, y: 0.775, title: "Aged midsole", note: "Pre-yellowed by design; no paint or restoration." },
    { x: 0.8, y: 0.72, title: "Toe box", note: "Perforations evenly spaced, panels aligned under UV." },
  ],
};

/** Products with a series of distinct angles (indices into the original photo list). */
export const ANGLES: Record<string, number[]> = {
  "air-jordan-1-low-se-navy-suede": [0, 1, 2, 3, 4, 5],
  "nike-sb-dunk-low-orange-mint": [0, 1, 2, 3, 4],
  "balenciaga-soccer-t-shirt-oversized": [0, 1, 2, 3],
  "adidas-yeezy-boost-350-v2-bone": [0, 1, 2],
  "gucci-logo-belt-bag-web": [0, 1, 2],
  "prada-cahier-shoulder-bag-silver": [0, 1, 2],
  "rolex-submariner-date-126610ln": [0, 1, 2],
};
