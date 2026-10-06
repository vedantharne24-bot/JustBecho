/**
 * Domain model for the JustBecho marketplace.
 *
 * These types mirror what a catalogue/orders API would return so the mock data
 * layer in `lib/data` can be replaced by network calls without touching UI code.
 */

export type CategorySlug =
  | "bags"
  | "watches"
  | "sneakers"
  | "streetwear"
  | "ready-to-wear"
  | "accessories";

export type Gender = "women" | "men" | "unisex";

export type Condition =
  | "new-with-tags"
  | "new-without-tags"
  | "like-new"
  | "excellent"
  | "very-good"
  | "good";

export type AvailabilityStatus = "available" | "reserved" | "sold";

export type AuthenticationStatus = "authenticated" | "in-review" | "pending";

export interface ImageCrop {
  /** Focal point, 0–1 from the left */
  x: number;
  /** Focal point, 0–1 from the top */
  y: number;
  /** Zoom factor (1 = none) */
  z: number;
}

export interface ProductImage {
  /** CDN asset key (e.g. `photo-…`), absolute URL or data URL */
  src: string;
  alt: string;
  /** Optional focal-point crop used to derive detail shots */
  crop?: ImageCrop;
  /** Dominant tone of the shot — tunes overlays and the placeholder */
  tone?: "light" | "dark";
  /** Tiny blurred preview shown while the photograph loads */
  blur?: string;
  /** Background-removed shot on the house studio backdrop */
  studio?: boolean;
}

export interface Hotspot {
  /** Position on the studio photograph, 0–1 */
  x: number;
  y: number;
  title: string;
  note: string;
}

export interface SizeOption {
  label: string;
  stock: number;
}

export interface ProductDetail {
  label: string;
  value: string;
}

export interface Authentication {
  status: AuthenticationStatus;
  certificateId: string;
  authenticatedOn?: string;
  authenticator?: string;
  checks: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string; // brand slug
  category: CategorySlug;
  subcategory: string;
  gender: Gender;
  price: number;
  retailPrice?: number;
  condition: Condition;
  conditionNotes: string;
  sizes: SizeOption[];
  sizeSystem: string;
  images: ProductImage[];
  description: string;
  colour: string;
  material: string;
  year?: string;
  includes: string[];
  details: ProductDetail[];
  sellerId: string;
  authentication: Authentication;
  status: AvailabilityStatus;
  listedAt: string;
  views: number;
  saves: number;
  tags: string[];
  shipsFrom: string;
  /** Transparent cut-out used by scroll scenes */
  cutout?: { src: string; aspect: number };
  /** Annotated points for the authentication report */
  hotspots?: Hotspot[];
  /** Indices of images that form a turnable sequence of angles */
  angles?: number[];
}

export interface Brand {
  slug: string;
  name: string;
  origin: string;
  founded: string;
  blurb: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: ProductImage;
  subcategories: string[];
}

export interface Seller {
  id: string;
  name: string;
  handle: string;
  type: "individual" | "boutique";
  location: string;
  rating: number;
  reviews: number;
  sales: number;
  joined: string;
  responseTime: string;
  verified: boolean;
  bio: string;
}

/* ── Catalogue querying ───────────────────────────────────────────────── */

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "most-saved";

export interface CatalogFilters {
  q?: string;
  category?: CategorySlug[];
  gender?: Gender[];
  brand?: string[];
  size?: string[];
  condition?: Condition[];
  minPrice?: number;
  maxPrice?: number;
  availability?: "available" | "all";
  authenticated?: boolean;
  sort?: SortKey;
}

/* ── Commerce ─────────────────────────────────────────────────────────── */

export interface CartLine {
  productId: string;
  size: string;
  quantity: number;
  addedAt: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type DeliveryMethod = "standard" | "express";

export type PaymentMethod = "upi" | "card" | "netbanking" | "emi";

export type OrderStage =
  | "placed"
  | "confirmed"
  | "shipped-to-hub"
  | "authenticating"
  | "approved"
  | "out-for-delivery"
  | "delivered";

export interface OrderLine {
  productId: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  address: Address;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  subtotal: number;
  shipping: number;
  protectFee: number;
  gst: number;
  total: number;
  /** Fixed stage for historical orders; live orders derive stage from time */
  stage?: OrderStage;
  estimatedDelivery: string;
}

export interface Notification {
  id: string;
  kind: "order" | "price" | "wishlist" | "account" | "editorial";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

/* ── Seller ───────────────────────────────────────────────────────────── */

export type ListingStatus = "active" | "pending" | "draft" | "sold" | "paused";

export interface SellerListing {
  id: string;
  productId?: string;
  productSlug?: string;
  title: string;
  brand: string;
  category: CategorySlug;
  price: number;
  condition: Condition;
  size: string;
  image: string;
  status: ListingStatus;
  createdAt: string;
  views: number;
  saves: number;
  description?: string;
  images?: string[];
}

export interface SellerOrder {
  id: string;
  listingTitle: string;
  brand: string;
  image: string;
  buyerCity: string;
  amount: number;
  payout: number;
  status: "awaiting-dispatch" | "in-transit" | "authenticating" | "completed";
  createdAt: string;
}

/* ── Concierge ────────────────────────────────────────────────────────── */

export interface ConciergeRequest {
  id: string;
  kind: "sourcing" | "question" | "viewing";
  createdAt: string;
  status: "received" | "in-progress" | "confirmed";
  title: string;
  detail: string;
  productSlug?: string;
  appointment?: { location: string; date: string; time: string };
}
