export const PRIMARY_NAV = [
  { label: "Explore", href: "/explore", menu: "explore" as const },
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Brands", href: "/brands", menu: "brands" as const },
  { label: "Edits", href: "/edits" },
];

export const SECONDARY_NAV = [
  { label: "Sell", href: "/sell" },
  { label: "Becho Protect", href: "/protect" },
];

export const DISCOVER_LINKS = [
  { label: "Just in", href: "/explore?sort=newest" },
  { label: "Most wanted", href: "/explore?sort=most-saved" },
  { label: "The Vault — ₹10 L and above", href: "/explore?min=1000000&sort=price-desc" },
  { label: "Under ₹25,000", href: "/explore?max=25000" },
  { label: "Collaborations", href: "/explore?q=collaboration" },
  { label: "The Edits", href: "/edits" },
  { label: "The Journal", href: "/journal" },
  { label: "Concierge — find a piece", href: "/concierge" },
];

export const FEATURED_BRANDS = [
  "hermes",
  "chanel",
  "louis-vuitton",
  "dior",
  "gucci",
  "prada",
  "rolex",
  "patek-philippe",
  "audemars-piguet",
  "cartier",
  "jordan",
  "off-white",
];

export const TRENDING_SEARCHES = [
  "Kelly",
  "Submariner",
  "Jordan 1",
  "Nautilus",
  "Lady Dior",
  "Supreme",
  "Cartier Santos",
  "Yeezy",
];

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { label: "Explore all", href: "/explore" },
      { label: "Women", href: "/women" },
      { label: "Men", href: "/men" },
      { label: "Brands A–Z", href: "/brands" },
      { label: "Just in", href: "/explore?sort=newest" },
      { label: "The Edits", href: "/edits" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Sell with JustBecho", href: "/sell" },
      { label: "Become a seller", href: "/sell/register" },
      { label: "Seller dashboard", href: "/seller" },
      { label: "Fees & payouts", href: "/sell#fees" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Becho Protect", href: "/protect" },
      { label: "How authentication works", href: "/protect#process" },
      { label: "Condition guide", href: "/help#condition" },
      { label: "Shipping & returns", href: "/help#shipping" },
    ],
  },
  {
    title: "Client care",
    links: [
      { label: "Concierge", href: "/concierge" },
      { label: "The Journal", href: "/journal" },
      { label: "Help centre", href: "/help" },
      { label: "Track an order", href: "/account/orders" },
      { label: "Your account", href: "/account" },
      { label: "Contact us", href: "/help#contact" },
    ],
  },
];
