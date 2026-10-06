# JustBecho — authenticated pre-owned luxury

A redesign of the JustBecho marketplace as a luxury brand that happens to sell:
editorial typography, cinematic scroll scenes, and a full buy/sell flow built around
**Becho Protect**, the authentication service.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

Everything runs on local mock data. Cart, wishlist, orders, account and seller state
are kept in `localStorage`. To start over, use **Account → Settings → Reset this preview**.

## What's included

| Area | Routes |
| --- | --- |
| Editorial home | `/` — a one-time seal intro, pinned hero (the framed photograph opens to full-bleed), brand marquee, **"Under the loupe"** (see below), category index, horizontal "Just in" rail, Becho Protect scroll story, curated edits, budget tiles, most wanted, the Vault, sell CTA, the Journal, testimonials |
| Editorial | `/edits`, `/edits/[slug]` (curated selections: weddings, gifting, a first watch, streetwear), `/journal`, `/journal/[slug]` (long-form articles with reading progress and shoppable product strips) |
| Concierge | `/concierge` (request a piece the specialists will source), plus **Ask a specialist** and **Book a private viewing** on every product page; requests are tracked in `/account/requests` |
| Discovery | `/explore`, `/women`, `/men`, `/categories/[slug]`, `/brands`, `/brands/[slug]` — URL-synced filters (category, department, brand, log-scale price, size, condition, availability), sorting, search-within, density toggle, chips, load more, mobile filter sheet |
| Search | Full-screen overlay (`⌘K` / `Ctrl K`): trending, recent, categories, live results from `/api/search`, keyboard navigation |
| Product | `/product/[slug]` — gallery with thumbnail rail and a lightbox (pinch, double-tap and pointer zoom, swipe between images), a 360-style **angle scrubber** where a piece was shot from several sides, the **authentication report** (the specialist's notes pinned to the studio photograph, with a loupe), a **market value** chart for investment pieces, condition meter, sizes, Becho Protect option, pincode delivery dates, seller, certificate, similar pieces, recently viewed |
| Buying | `/wishlist`, `/cart` (plus a cart drawer), `/checkout` (address → delivery → review → payment), `/checkout/success` |
| Account | `/account`, `/account/orders`, `/account/orders/[id]` (live tracking timeline), `/account/wishlist`, `/account/addresses`, `/account/recently-viewed`, `/account/notifications`, `/account/settings` |
| Trust | `/protect` — the authentication process, category checks, certificate, guarantee, pricing, FAQ |
| Selling | `/sell` (payout calculator, fees), `/sell/register`, `/seller` (overview, listings, orders, earnings), `/seller/new` (category → brand → details → photos → condition → price → review) |
| Support | `/help` (condition guide, shipping and returns, contact form), custom 404 and error pages |

The seller centre offers a **demo store** ("The Archive Bombay") so the dashboard can
be reviewed with data, or a fresh store via registration.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
GSAP + ScrollTrigger + SplitText · Lenis · Motion · Zustand · Radix primitives
(Dialog, Slider) · Lucide icons.

## Design system

Tokens live in `src/app/globals.css`.

- **Palette:** warm blacks (`ink`, `onyx`, `graphite`) and paper whites (`ivory`, `paper`,
  `bone`), a metallic `champagne` for seal details, and one signature accent, **Seal**
  (`#a8362a`, brighter on dark). The accent marks authentication, counts and the one
  decisive CTA.
- **Semantic tokens** (`bg`, `surface`, `fg`, `muted`, `line`, `accent`, `success`, `error`…)
  are remapped by `.theme-dark`, so any section can switch surface with one class.
- **Type:** Bodoni Moda (display, optical sizes), Hanken Grotesk (UI and body), DM Mono
  (labels, certificate IDs, order numbers). The scale is `display-xl` / `-lg` / `-md` /
  `-sm`, `title`, `lede`, `label`, `mono`.
- **Geometry:** 1px hairlines, near-square corners, a 12-column grid, and `container-x`
  gutters of `clamp(1rem, 3.2vw, 3rem)`.

## Motion system

Defined in `src/lib/motion.ts` and as CSS variables:

| Tier | Duration | Used for |
| --- | --- | --- |
| Fast | ~200 ms | hover, press, toggles |
| Base | ~420 ms | drawers, menus, steps |
| Slow | ~900 ms | section reveals, image masks |

There is one easing family: expo-out for entrances and a symmetric in-out for state changes.

- **Scroll scenes** (GSAP, desktop only, `gsap.matchMedia`): the hero pin, the "Just in"
  horizontal track, the Protect story and parallax. All are transform/opacity/clip-path only.
- **"Under the loupe"** (`components/home/product-showcase.tsx`): the signature scene. The
  stage pins and four cut-out pieces take turns in a pool of light. Each rises in, turns
  with the pointer, and the specialist's notes draw out on leader lines from the exact
  details they describe. The notes come from the same hotspot data as the authentication
  report. A side index jumps between pieces. On touch screens and with reduced motion
  it becomes a stack of annotated cards.
- **First visit:** a short seal-and-wordmark curtain, at most once per session, decided
  before hydration so it never flashes. It is skipped entirely for reduced motion.
- **Smooth scroll:** Lenis drives GSAP's ticker. It is off for touch devices and for reduced motion.
- **Reveals:** one global `IntersectionObserver` plus CSS (`data-reveal`, `data-reveal="mask"`).
  Content is only hidden when JS is confirmed, so nothing disappears if scripts fail.
  Mask reveals slide a CSS mask rather than animating `clip-path`. Chrome's observer
  treats a target's own clip-path as hiding it, so a fully clipped element is never
  seen and never revealed.
- **Page transitions:** React `<ViewTransition>` gives a short cross-fade and lift between
  routes. Product images morph from grid card to product page. The header stays anchored.
- **UI motion:** Motion loaded lazily via `LazyMotion`, for drawers, overlays, steps,
  toasts, the wishlist heart and list reflow.
- **Reduced motion:** all of the above collapse to instant state changes.

## Architecture

```
src/
  app/                 routes, route handlers (api/products, api/search, api/price-guide)
  components/
    layout/            header, mega menu, mobile menu, search overlay, footer, page shell
    home/ protect/ explore/ product/ cart/ checkout/ account/ sell/ seller/ wishlist/ help/
    ui/                buttons, fields, sheet, listbox, accordion, steps, seal, skeletons…
    motion/            Parallax, SplitReveal
    providers/         smooth scroll, store hydration, reveal observer, cursor
  hooks/               useProducts, useCartSummary, media queries, hydration
  lib/
    data/              mock catalogue: products, brands, categories, sellers, Protect stages,
                       edits, journal, inspection hotspots, generated studio metadata
    api/catalog.ts     server-side catalogue service (async, swappable)
    api/editorial.ts   edits and journal service
    catalog.ts         pure search / filter / facet / URL logic
    market.ts          market-value series for investment pieces
    orders.ts fees.ts payments.ts validation.ts format.ts image-loader.ts
  store/               Zustand stores (cart, wishlist, history, account, seller, ui, toast)
scripts/               offline asset generation (own package.json; not part of the app build)
  studio/              cutout.mjs → compose.mjs: studio photography from source photos
  logo/                build.mjs: wordmark and monogram outlines from Bodoni Moda
public/catalog/        studio photographs (480 / 960 / 1440 px WebP)
public/cutouts/        transparent cut-outs for scroll scenes (640 / 1200 px WebP)
```

### Studio photography

Marketplace photos arrive in every light and on every surface. To make the catalogue
read as one shoot, products are cut out of their source photograph and placed on a
single house backdrop with a shared floor line, scale and contact shadow. Pieces cropped
by their frame, such as a coat on a model, are anchored to the bottom edge instead.

```bash
cd scripts && npm install
npm run studio:cutout     # local background removal; cached in studio/.cache
npm run studio:compose    # writes public/catalog, public/cutouts, src/lib/data/studio.ts
```

Background removal runs locally, with no external service and no per-image cost.
**Review every cut-out** before adding it to `studio/list.json`. 50 of the 65 products
passed. The rest keep their original photograph because the cut-out left residue, a
stray hand or a clipped edge. On cards, hovering a studio shot reveals the original
photograph. In production this step belongs in the listing pipeline, run when a seller
uploads.

The wordmark and monogram are SVG outlines generated from Bodoni Moda (`npm run logo`),
with a sturdier optical size for the header and a high-contrast one for display. The
logo renders identically everywhere and needs no font download.

### Connecting a real backend

These are the integration seams; UI code doesn't need to change:

- **Catalogue:** `src/lib/api/catalog.ts`. Every function is async and returns the
  `Product` / `Brand` / `Category` types in `src/lib/types.ts`. Replace the in-memory
  seed with `fetch` calls.
- **Search and facets:** `src/lib/catalog.ts` (`queryProducts`, `getFacets`,
  `searchProducts`) and `src/app/api/search`. Swap in Algolia, Typesense or Elastic.
- **Client lookups:** `useProducts` resolves ids held in client state through
  `/api/products`.
- **Payments:** `src/lib/payments.ts`. `createCheckoutSession` is the only seam.
  The current provider is a clearly labelled demo that takes no payment and never
  collects card data. A Razorpay or Stripe provider would create a server order and
  open its hosted checkout.
- **Orders, account, seller:** the Zustand stores in `src/store/` mirror API resources.
  Replace their actions with mutations (server actions or route handlers).
- **Media:** `src/lib/image-loader.ts` builds CDN URLs, including focal-point detail crops.
  Point it at the marketplace's own media CDN.

## Notes

- Photography is from Unsplash. Originals are served through its image CDN at the
  exact width each `next/image` slot needs. Studio shots are local derivatives of the
  same photographs. Brand names describe pre-owned goods. No brand assets, logos or
  source code from the existing JustBecho site are used.
- People, sellers, prices, reviews and statistics in the mock data are illustrative.
  So are the **market value** series. They are generated deterministically per product
  in `src/lib/market.ts` and would come from completed-sales data in production. Edits,
  Journal articles, specialist notes and concierge requests are mock content too, and
  concierge requests are stored locally like the rest of the account.
#   J u s t B e c h o  
 