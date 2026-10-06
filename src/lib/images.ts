import type { ImageCrop, ProductImage } from "@/lib/types";

/**
 * Builds a CDN asset key. Detail shots are derived from the master photograph
 * with a focal-point crop, the same way a media pipeline would generate
 * close-ups from a single high-resolution capture.
 */
export function assetKey(id: string, crop?: ImageCrop, aspect = "4:5"): string {
  const key = `photo-${id}`;
  if (!crop) return key;
  const params = new URLSearchParams({
    fit: "crop",
    crop: "focalpoint",
    "fp-x": String(crop.x),
    "fp-y": String(crop.y),
    "fp-z": String(crop.z),
    ar: aspect,
  });
  return `${key}?${params.toString()}`;
}

export function photo(
  id: string,
  alt: string,
  opts: { crop?: ImageCrop; tone?: "light" | "dark" } = {},
): ProductImage {
  return { src: assetKey(id, opts.crop), alt, crop: opts.crop, tone: opts.tone };
}

/** Editorial photography used across campaign surfaces */
export const editorial = {
  heroCoat: photo("1603189343302-e603f7add05a", "Model in an oversized black wool coat, photographed in black and white", { tone: "light" }),
  heroHair: photo("1574015974293-817f0ebebb74", "Portrait of a model in black, hair caught in motion", { tone: "light" }),
  gloves: photo("1762635696772-0ed637b1a3a7", "Model in sheer black gloves against a dark backdrop", { tone: "dark" }),
  puffer: photo("1538329972958-465d6d2144ed", "Model in a yellow puffer jacket and sunglasses", { tone: "light" }),
  bagHands: photo("1683921470299-b8f0f3331657", "Hands presenting a grey leather top-handle bag with a gold clasp", { tone: "light" }),
  closet: photo("1618236444721-4a8dba415c15", "Illuminated wardrobe shelves holding designer bags and shoes", { tone: "light" }),
  atelier: photo("1546333456-3e8ed81f41e2", "A leather holdall resting beside an upholstered chair in a dressing room", { tone: "light" }),
  shipBox: photo("1631010231130-5c7828d9a3a7", "A plain kraft shipping box with a blank label", { tone: "light" }),
  hubVan: photo("1617909517054-64d4958be1c9", "Parcels stacked inside a delivery van", { tone: "dark" }),
  loupe: photo("1725960103635-0a6709f97126", "Authenticator examining a watch through a jeweller's loupe", { tone: "dark" }),
  cots: photo("1679134015772-943d09a750ae", "Watchmaker with a loupe and protective finger cots inspecting a movement", { tone: "dark" }),
  bench: photo("1788125856697-04067c752525", "Close inspection of a watch case under magnification", { tone: "dark" }),
  movement: photo("1789238959604-908d95334e96", "An exposed mechanical movement beside a watchmaker's screwdriver", { tone: "dark" }),
  movementHolder: photo("1788125856730-2dc2c904e9bf", "A watch movement held in a bench holder", { tone: "dark" }),
  glovedPatek: photo("1663564307062-8b6fda73705d", "Gloved hand holding a perpetual calendar wristwatch", { tone: "dark" }),
  glovedCaseback: photo("1663564307102-6df750b2196b", "Gloved hands presenting an engraved caseback", { tone: "dark" }),
  glovedOpen: photo("1663564305613-c40450f29903", "Gloved hands opening a hunter caseback", { tone: "dark" }),
  sealedBox: photo("1759563874833-d8f97cef9d32", "A white presentation box closed with a black wax seal", { tone: "light" }),
  sealedOpen: photo("1759563874669-0b6f7337e66a", "An opened presentation box tied with cord and a wax seal", { tone: "light" }),
  handover: photo("1566576721346-d4a3b4eaeb55", "A parcel being handed from one person to another", { tone: "light" }),
  hermesHorse: photo("1621735320215-ad74567fcbf2", "A sculpted leather horse head in a boutique window", { tone: "dark" }),
  scarfPortrait: photo("1558600333-fd674768ae04", "Woman wearing a printed silk scarf over her hair", { tone: "light" }),
  wristDaytona: photo("1606744188285-d0a49e58f538", "A steel chronograph on the wrist in low light", { tone: "dark" }),
  sneakerPair: photo("1661324257527-ce9379163e1b", "A pair of yellow and black high-top sneakers against black", { tone: "dark" }),
  supremeBW: photo("1503431194692-82dd03d18093", "Black and white portrait in a script-logo varsity jacket", { tone: "dark" }),
  trench: photo("1633821879282-0c4e91f96232", "Model in a belted beige trench coat", { tone: "light" }),
  sunglassesDark: photo("1642439048981-8d679ad5f843", "Black sunglasses on slate in low light", { tone: "dark" }),
} as const;
