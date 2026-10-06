/**
 * Step 1 of the studio pipeline: cut each product out of its source photograph.
 *
 *   cd scripts && npm install && npm run studio:cutout [slug,slug…]
 *
 * Background removal runs locally (@imgly/background-removal-node, "medium"
 * model) — no external service and no per-image cost. Originals and cut-outs are
 * cached in studio/.cache, so re-runs only process new entries in list.json.
 * Review every cut-out before composing: anything with residue, a missing edge or
 * a stray hand should be left out of list.json and keep its original photograph.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

const here = path.dirname(fileURLToPath(import.meta.url));
const cache = path.join(here, ".cache");
const list = JSON.parse(fs.readFileSync(path.join(here, "list.json"), "utf8"));
const only = process.argv[2]?.split(",");
fs.mkdirSync(path.join(cache, "orig"), { recursive: true });
fs.mkdirSync(path.join(cache, "cut"), { recursive: true });

for (const item of list) {
  if (only && !only.includes(item.slug)) continue;
  const out = path.join(cache, "cut", `${item.slug}.png`);
  if (fs.existsSync(out) && !only) continue;
  try {
    const original = path.join(cache, "orig", `${item.id}.jpg`);
    if (!fs.existsSync(original)) {
      const res = await fetch(`https://images.unsplash.com/photo-${item.id}?w=1400&q=90&fm=jpg`);
      if (!res.ok) throw new Error(`download failed (${res.status})`);
      fs.writeFileSync(original, Buffer.from(await res.arrayBuffer()));
    }
    const blob = await removeBackground(new Blob([fs.readFileSync(original)], { type: "image/jpeg" }), {
      model: "medium",
      output: { format: "image/png" },
    });
    fs.writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
    console.log("cut", item.slug);
  } catch (error) {
    console.log("FAILED", item.slug, error.message);
  }
}
