"""
Step 1b of the studio pipeline: high-quality mattes and per-photo refinement.

    cd scripts
    python -m venv .venv && .venv/Scripts/pip install -r studio/requirements.txt   (Windows)
    python -m venv .venv && .venv/bin/pip install -r studio/requirements.txt       (macOS/Linux)
    .venv/Scripts/python studio/segment.py [slug,slug…]

Runs for list.json entries that ask for it:

  "matte": "birefnet"     matte with BiRefNet (fine edges: chains, straps, raffia)
                          instead of the default cut-out from cutout.mjs
  "keep": [[x, y], …]     Segment Anything points on the product (source pixels);
  "drop": [[x, y], …]     points on things to remove — hands, props, stands;
  "box":  [x1, y1, x2, y2]  an optional box around the product
  "parts": [{"box": …, "drop": …}, …]  several selections, merged — one box per
                          object is SAM's most reliable prompt
  "crop": {"top": …, "right": …, "bottom": …, "left": …}
                          erase everything outside these source-pixel bounds
  "erase": [[x1, y1, x2, y2] or [[x, y], …], …]  erase rectangles or polygons
  "fill": true            close holes inside the piece (white-on-white photos)
  "clean": 0.02           drop specks smaller than this share of the largest part
  "rotate": -12           turn the result (degrees, clockwise) to stand a piece upright

SAM only decides which regions stay; the edges always come from the matte. Edge
colours are then re-estimated so the old background doesn't halo onto the backdrop.
Everything runs locally; models download once into ~/.rembg.
"""

import json
import os
import sys
import urllib.request

import cv2
import numpy as np
from PIL import Image
from pymatting import estimate_foreground_ml
from rembg import new_session, remove

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
REFINES = ("matte", "keep", "drop", "box", "parts", "crop", "erase", "fill", "clean", "rotate")

_sessions = {}


def session(name):
    if name not in _sessions:
        _sessions[name] = new_session(name)
    return _sessions[name]


def source(item):
    path = os.path.join(CACHE, "orig", f"{item['id']}.jpg")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        url = f"https://images.unsplash.com/photo-{item['id']}?w=1400&q=90&fm=jpg"
        urllib.request.urlretrieve(url, path)
    return Image.open(path).convert("RGB")


def base_alpha(item, image):
    if item.get("matte") == "birefnet":
        mask = remove(image, session=session("birefnet-general"), only_mask=True)
        return np.asarray(mask.convert("L"), dtype=np.float32) / 255
    cut = os.path.join(CACHE, "cut", f"{item['slug']}.png")
    if not os.path.exists(cut):
        raise FileNotFoundError(f"{item['slug']}: no cut-out yet — run studio:cutout first")
    return np.asarray(Image.open(cut).convert("RGBA"), dtype=np.float32)[..., 3] / 255


def sam_part(part, image):
    """One Segment Anything selection. Its encoder works on a fixed landscape
    frame, so portrait photos go in turned on their side for full resolution."""
    w, h = image.size
    portrait = h > w
    turn = (lambda p: [p[1], w - 1 - p[0]]) if portrait else (lambda p: list(p))
    prompt = [{"type": "point", "data": turn(p), "label": 1} for p in part.get("keep", [])]
    prompt += [{"type": "point", "data": turn(p), "label": 0} for p in part.get("drop", [])]
    if "box" in part:
        x1, y1, x2, y2 = part["box"]
        (a, b), (c, d) = turn([x1, y1]), turn([x2, y2])
        prompt.append({"type": "rectangle", "data": [min(a, c), min(b, d), max(a, c), max(b, d)], "label": 1})
    src = image.transpose(Image.Transpose.ROTATE_90) if portrait else image
    mask = remove(src, session=session("sam"), sam_prompt=prompt, only_mask=True)
    if portrait:
        mask = mask.transpose(Image.Transpose.ROTATE_270)
    return (np.asarray(mask.convert("L")) > 127).astype(np.uint8)


def sam_mask(item, image):
    # "parts" selects several objects (one box each — SAM's most reliable prompt)
    parts = item.get("parts") or [item]
    m = np.zeros((image.size[1], image.size[0]), dtype=np.uint8)
    for part in parts:
        m = np.maximum(m, sam_part(part, image))
    # SAM shies away from the photo's border; where a selection comes close,
    # carry it to the edge so a piece cropped by the frame stays cropped by it
    reach = max(4, round(max(m.shape) * 0.05))
    for view in (m, m.T):
        for line in view:
            near = np.flatnonzero(line[:reach])
            if near.size:
                line[: near[0]] = 1
            far = np.flatnonzero(line[-reach:])
            if far.size:
                line[len(line) - reach + far[-1]:] = 1
    # SAM's boundary is coarse; grow it slightly so the matte's own edge decides
    grow = max(3, round(max(m.shape) * 0.006))
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (grow * 2 + 1, grow * 2 + 1)))
    return cv2.GaussianBlur(m.astype(np.float32), (0, 0), grow / 2)


def clean(alpha, share):
    solid = (alpha > 0.1).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(solid, connectivity=8)
    if count <= 2:
        return alpha
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep = np.ones(count, dtype=bool)  # label 0 holds the faint edge pixels; keep them
    keep[1:] = areas >= areas.max() * share
    return alpha * keep[labels]


def fill_holes(alpha):
    """Solidify enclosed gaps — white-on-white photos leave holes inside a piece."""
    solid = (alpha > 0.5).astype(np.uint8)
    seal = max(3, round(max(alpha.shape) * 0.006))
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (seal * 2 + 1, seal * 2 + 1)))
    padded = np.pad(solid, 1)
    cv2.floodFill(padded, None, (0, 0), 2)
    holes = (padded[1:-1, 1:-1] == 0).astype(np.float32)
    return np.maximum(alpha, cv2.GaussianBlur(holes, (0, 0), 1.5))


def refine(item):
    image = source(item)
    alpha = base_alpha(item, image)
    if any(k in item for k in ("keep", "drop", "box", "parts")):
        alpha = alpha * np.clip(sam_mask(item, image), 0, 1)
    if "crop" in item:
        c = item["crop"]
        h, w = alpha.shape
        keep = np.zeros_like(alpha)
        keep[c.get("top", 0):c.get("bottom", h), c.get("left", 0):c.get("right", w)] = 1
        alpha = alpha * keep
    for region in item.get("erase", []):
        if len(region) == 4 and all(isinstance(v, (int, float)) for v in region):
            x1, y1, x2, y2 = region
            alpha[y1:y2, x1:x2] = 0
        else:  # a polygon of [x, y] points
            hole = np.zeros(alpha.shape, dtype=np.uint8)
            cv2.fillPoly(hole, [np.array(region, dtype=np.int32)], 1)
            alpha[hole > 0] = 0
    if item.get("fill"):
        alpha = fill_holes(alpha)
    alpha = clean(alpha, item.get("clean", 0.02))
    rgb = np.asarray(image, dtype=np.float64) / 255
    fg = estimate_foreground_ml(rgb, alpha.astype(np.float64))
    out = Image.fromarray(np.dstack([np.clip(fg, 0, 1) * 255, alpha * 255]).round().astype(np.uint8), "RGBA")
    if item.get("rotate"):
        out = out.rotate(-item["rotate"], resample=Image.BICUBIC, expand=True)
    # Written beside the raw cut-outs, never over them, so re-runs start fresh
    os.makedirs(os.path.join(CACHE, "refined"), exist_ok=True)
    out.save(os.path.join(CACHE, "refined", f"{item['slug']}.png"))


def main():
    with open(os.path.join(HERE, "list.json"), encoding="utf8") as f:
        items = json.load(f)
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
    for item in items:
        if only and item["slug"] not in only:
            continue
        if not any(k in item for k in REFINES):
            continue
        refine(item)
        print("refined", item["slug"], flush=True)


if __name__ == "__main__":
    main()
