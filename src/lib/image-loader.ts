"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

const UNSPLASH = "https://images.unsplash.com/";

const LOCAL_SIZES = [
  { prefix: "/catalog/", sizes: [480, 960, 1440] },
  { prefix: "/cutouts/", sizes: [640, 1200] },
];

/**
 * Custom next/image loader.
 *
 * Sources in the catalogue are stored as CDN asset keys (`photo-…`), optionally
 * carrying rendering hints such as focal-point crops (`photo-…?fp-z=2`). When the
 * media pipeline moves to a first-party CDN only this function needs to change.
 */
export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;

  // Studio photographs and cut-outs are pre-rendered at fixed widths
  const local = LOCAL_SIZES.find((l) => src.startsWith(l.prefix));
  if (local) {
    const size = local.sizes.find((s) => s >= width) ?? local.sizes[local.sizes.length - 1];
    return src.replace(/\.webp$/, `-${size}.webp`);
  }

  const isAssetKey = src.startsWith("photo-");
  const isUnsplash = src.startsWith(UNSPLASH);

  if (isAssetKey || isUnsplash) {
    const raw = isAssetKey ? UNSPLASH + src : src;
    const [base, query = ""] = raw.split("?");
    const params = new URLSearchParams(query);
    params.set("w", String(width));
    params.set("q", String(quality ?? 72));
    params.set("auto", "format");
    if (!params.has("fit")) params.set("fit", "max");
    return `${base}?${params.toString()}`;
  }

  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}`;
}
