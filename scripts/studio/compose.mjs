/**
 * Step 2 of the studio pipeline: place each cut-out on the house backdrop.
 *
 *   cd scripts && npm run studio:compose [slug,slug…]
 *
 * Free-standing objects share one floor line, scale and contact shadow, so a grid
 * reads as a single shoot. Pieces cropped by their original frame (a coat on a
 * model, a shoe held from above) are "figures": anchored to the same edges they
 * run off in the source. Set "grounded": true in list.json for a figure that
 * enters from the top but stands on the floor (shoes worn on legs), "fade" to
 * dissolve edges instead (a bracelet running out of frame), "suspended" for a
 * piece hanging in frame, "bleed" to crop a piece at an edge on purpose, and
 * "plate" to mount a photograph that has nothing to cut out.
 *
 * Writes public/catalog/<slug>-{480,960,1440}.webp, transparent cut-outs for
 * scroll scenes in public/cutouts/<slug>-{640,1200}.webp, and regenerates
 * src/lib/data/studio.ts (blur placeholder, framing box, cut-out aspect).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const cutDir = path.join(here, ".cache", "cut");
const refinedDir = path.join(here, ".cache", "refined");
// segment.py's refined matte wins over the raw cut-out when there is one
const cutFile = (slug) => [path.join(refinedDir, `${slug}.png`), path.join(cutDir, `${slug}.png`)].find((f) => fs.existsSync(f));
const catalogDir = path.join(root, "public", "catalog");
const cutoutDir = path.join(root, "public", "cutouts");
const dataFile = path.join(root, "src", "lib", "data", "studio.ts");

const W = 1600, H = 2000;
const list = JSON.parse(fs.readFileSync(path.join(here, "list.json"), "utf8"));
const only = process.argv[2]?.split(",");
fs.mkdirSync(catalogDir, { recursive: true });
fs.mkdirSync(cutoutDir, { recursive: true });

const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#f3efe8"/>
      <stop offset="70%" stop-color="#e9e4da"/>
      <stop offset="100%" stop-color="#dfd9ce"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.045"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect y="${H * 0.62}" width="100%" height="${H * 0.38}" fill="url(#floor)"/>
</svg>`);

/**
 * Bounding box of everything meaningfully opaque, and which edges of the source
 * frame the piece runs off. Mattes often fade in the last few pixels, so an edge
 * counts if enough of the piece reaches a thin band along it.
 */
async function alphaBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      if (data[row + x] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const band = (n) => Math.max(2, Math.round(n * 0.004));
  const reach = (count, length) => count >= Math.max(8, length * 0.015);
  const across = (inBand, length, depth) => {
    let count = 0;
    for (let i = 0; i < length; i++) {
      for (let d = 0; d < depth; d++) {
        if (inBand(i, d) > 24) {
          count++;
          break;
        }
      }
    }
    return count;
  };
  const bx = band(width), by = band(height);
  const edges = {
    top: reach(across((x, d) => data[d * width + x], width, by), width),
    bottom: reach(across((x, d) => data[(height - 1 - d) * width + x], width, by), width),
    left: reach(across((y, d) => data[y * width + d], height, bx), height),
    right: reach(across((y, d) => data[y * width + width - 1 - d], height, bx), height),
  };
  return { minX, minY, maxX, maxY, width, height, edges };
}

const shadowLayer = async (svg, blur) =>
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`)).blur(blur).png().toBuffer();

/** Multiplies a piece's alpha by a ramp so the named edges dissolve into the backdrop. */
async function fadeEdges(buffer, width, height, sides) {
  const f = 0.16;
  const ramp = (id, horizontal, from, to) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${horizontal ? 1 : 0}" y2="${horizontal ? 0 : 1}">
      <stop offset="0" stop-color="#fff" stop-opacity="${from ? 0 : 1}"/>
      <stop offset="${from ? f : 0}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="${to ? 1 - f : 1}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="${to ? 0 : 1}"/>
    </linearGradient>`;
  const masks = [];
  if (sides.includes("top") || sides.includes("bottom")) masks.push(["v", false, sides.includes("top"), sides.includes("bottom")]);
  if (sides.includes("left") || sides.includes("right")) masks.push(["h", true, sides.includes("left"), sides.includes("right")]);
  let out = buffer;
  for (const [id, horizontal, from, to] of masks) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs>${ramp(id, horizontal, from, to)}</defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
    out = await sharp(out).composite([{ input: Buffer.from(svg), blend: "dest-in" }]).png().toBuffer();
  }
  return out;
}

/**
 * The piece to place: a trimmed cut-out, or — for a photograph with nothing to
 * cut out, like draped silk — the photograph itself, mounted as a framed plate.
 */
async function pieceFor(item) {
  if (item.plate) {
    const { x, y, size } = item.plate;
    const photo = await sharp(path.join(here, ".cache", "orig", `${item.id}.jpg`)).extract({ left: x, top: y, width: size, height: size }).resize(1000, 1000).toBuffer();
    const mat = 64, frame = 10;
    const plate = await sharp(photo)
      .extend({ top: mat, bottom: mat, left: mat, right: mat, background: "#f7f3ec" })
      .extend({ top: frame, bottom: frame, left: frame, right: frame, background: "#2a241c" })
      .png()
      .toBuffer();
    const side = 1000 + 2 * (mat + frame);
    return { trimmed: plate, bw: side, bh: side, edges: { top: false, bottom: false, left: false, right: false }, framed: true };
  }
  const file = cutFile(item.slug);
  const box = await alphaBox(file);
  const bw = box.maxX - box.minX + 1, bh = box.maxY - box.minY + 1;
  let trimmed = await sharp(file).extract({ left: box.minX, top: box.minY, width: bw, height: bh }).png().toBuffer();
  const edges = { ...box.edges };
  // "bleed": run the piece off these edges on purpose (after a crop in segment.py)
  for (const side of item.bleed ?? []) edges[side] = true;
  if (item.fade) {
    trimmed = await fadeEdges(trimmed, bw, bh, item.fade);
    for (const side of item.fade) edges[side] = false;
  }
  return { trimmed, bw, bh, edges, framed: false };
}

async function compose(item) {
  const { trimmed, bw, bh, edges, framed } = await pieceFor(item);

  // Framing follows the source: wherever the original photograph crops the piece,
  // the studio frame crops it at the same edge, so nothing ends in a hard line
  // mid-air. Pieces held from above hang from the top edge; anything standing
  // ("grounded") meets the shared floor line. Pieces whose ends dissolve ("fade")
  // or that hang in frame ("suspended") float above a soft pool of shadow.
  const floorY = H * 0.8;
  const cropped = edges.top || edges.bottom || edges.left || edges.right;
  const floating = Boolean(item.fade || item.suspended) && !edges.top && !edges.bottom;
  const hanging = (edges.top && !edges.bottom && !item.grounded) || floating;
  let scale;
  if (edges.top && edges.bottom) scale = H / bh;
  else if (edges.top && item.grounded) scale = floorY / bh;
  else if (edges.left && edges.right) scale = W / bw;
  else if (floating) scale = Math.min((W * 0.78) / bw, (H * 0.72) / bh);
  else if (hanging) scale = Math.min((W * 0.8) / bw, (H * 0.74) / bh);
  else if (cropped) scale = Math.min((W * 0.9) / bw, (H * 0.9) / bh);
  else scale = Math.min((W * 0.72) / bw, (H * 0.6) / bh);
  const tw = Math.round(bw * scale), th = Math.round(bh * scale);
  const left = edges.left ? 0 : edges.right ? W - tw : Math.round((W - tw) / 2);
  const top = edges.bottom ? H - th : edges.top ? 0 : floating ? Math.round(H * 0.43 - th / 2) : Math.round(floorY - th);

  const layers = [];
  if (!edges.bottom) {
    const cx = left + tw / 2;
    const sw = Math.round(tw * 0.92), sh = Math.max(24, Math.round(tw * 0.07));
    if (hanging) {
      // Suspended: only a wide, faint pool far below
      layers.push({ input: await shadowLayer(`<ellipse cx="${cx}" cy="${floorY}" rx="${sw * 0.4}" ry="${sh * 0.6}" fill="#1a160f" fill-opacity="0.14"/>`, Math.max(30, sh)) });
    } else {
      // A soft pool of shadow plus a tight contact line where the piece meets the floor
      layers.push(
        { input: await shadowLayer(`<ellipse cx="${cx}" cy="${floorY - sh * 0.15}" rx="${sw / 2}" ry="${sh / 2}" fill="#1a160f" fill-opacity="0.22"/>`, Math.max(18, sh * 0.6)) },
        { input: await shadowLayer(`<ellipse cx="${cx}" cy="${floorY - 4}" rx="${tw * 0.36}" ry="${Math.max(6, sh * 0.16)}" fill="#120f0a" fill-opacity="0.32"/>`, 8) },
      );
    }
  }
  // Pieces wider than the frame (a full-height figure) lose their sides, centred
  let piece = await sharp(trimmed).resize(tw, th).toBuffer();
  let x = left;
  if (tw > W) {
    x = 0;
    const from = edges.left ? 0 : edges.right ? tw - W : Math.round((tw - W) / 2);
    piece = await sharp(piece).extract({ left: from, top: 0, width: W, height: Math.min(th, H) }).toBuffer();
  }
  layers.push({ input: piece, left: x, top: Math.max(0, top) });
  // Only whole, uncropped cut-outs work in scroll scenes
  const figure = cropped || framed || Boolean(item.fade);

  const composed = await sharp(backdrop).composite(layers).png().toBuffer();
  for (const w of [480, 960, 1440]) {
    await sharp(composed).resize(w).webp({ quality: 82 }).toFile(path.join(catalogDir, `${item.slug}-${w}.webp`));
  }
  const blur = await sharp(composed).resize(16).webp({ quality: 40 }).toBuffer();

  // Transparent cut-out for scroll scenes (trimmed, with a little air)
  const cut = await sharp(trimmed).extend({ top: 20, bottom: 20, left: 20, right: 20, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const meta = await sharp(cut).metadata();
  if (!figure) {
    for (const w of [640, 1200]) {
      await sharp(cut).resize({ width: Math.min(w, meta.width) }).webp({ quality: 84, alphaQuality: 90 }).toFile(path.join(cutoutDir, `${item.slug}-${w}.webp`));
    }
  }

  return {
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    figure,
    box: { x: left / W, y: top / H, w: tw / W, h: th / H },
    cutAspect: Math.round((meta.width / meta.height) * 10000) / 10000,
  };
}

// Keep entries that aren't being rebuilt this run
const source = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, "utf8") : "";
const existing = source ? JSON.parse(source.slice(source.indexOf("= {") + 2, source.lastIndexOf("}") + 1)) : {};
const studio = {};
for (const item of list) {
  const hasCut = Boolean(item.plate || cutFile(item.slug));
  if ((only && !only.includes(item.slug)) || !hasCut) {
    if (existing[item.slug]) studio[item.slug] = existing[item.slug];
    else if (!hasCut) console.log("skipped (no cut-out — run studio:cutout)", item.slug);
    continue;
  }
  const entry = await compose(item);
  entry.box = Object.fromEntries(Object.entries(entry.box).map(([k, v]) => [k, Math.round(v * 10000) / 10000]));
  studio[item.slug] = entry;
  console.log("composed", item.slug, entry.figure ? "(figure)" : "");
}

fs.writeFileSync(
  dataFile,
  `/* Generated by scripts/studio/compose.mjs: background-removed product shots composited on the house backdrop. */

export interface StudioEntry {
  blur: string;
  figure: boolean;
  box: { x: number; y: number; w: number; h: number };
  cutAspect: number;
}

export const STUDIO: Record<string, StudioEntry> = ${JSON.stringify(studio, null, 1)};
`,
);
console.log(`Wrote ${Object.keys(studio).length} entries to ${path.relative(process.cwd(), dataFile)}`);
