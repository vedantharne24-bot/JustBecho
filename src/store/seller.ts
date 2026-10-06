"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ListingStatus, SellerListing, SellerOrder } from "@/lib/types";
import { assetKey } from "@/lib/images";
import { uid } from "@/lib/utils";
import { commissionFor } from "@/lib/fees";

export interface SellerProfile {
  storeName: string;
  fullName: string;
  email: string;
  phone: string;
  type: "individual" | "boutique";
  city: string;
  pincode: string;
  upi: string;
  gstin?: string;
  categories: string[];
}

interface SellerState {
  profile: SellerProfile | null;
  mode: "none" | "demo" | "registered";
  listings: SellerListing[];
  orders: SellerOrder[];
  register: (profile: SellerProfile) => void;
  startDemo: () => void;
  signOut: () => void;
  addListing: (listing: Omit<SellerListing, "id" | "createdAt" | "views" | "saves" | "status">) => SellerListing;
  setListingStatus: (id: string, status: ListingStatus) => void;
  setListingPrice: (id: string, price: number) => void;
  removeListing: (id: string) => void;
  markDispatched: (id: string) => void;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const DEMO_PROFILE: SellerProfile = {
  storeName: "The Archive Bombay",
  fullName: "Zoya Merchant",
  email: "zoya@archivebombay.in",
  phone: "+91 98191 22045",
  type: "boutique",
  city: "Mumbai",
  pincode: "400005",
  upi: "archivebombay@okhdfc",
  gstin: "27AAKFA4417Q1ZT",
  categories: ["bags", "accessories"],
};

/** The demo boutique's live pieces mirror its listings in the catalogue */
const DEMO_LIVE = [
  { id: "jb-0001", slug: "hermes-kelly-28-sellier-bleu-paon", title: "Kelly 28 Sellier", brand: "hermes", price: 1980000, condition: "like-new" as const, image: "1652427019217-3ded1a356f10", views: 4210, saves: 388 },
  { id: "jb-0002", slug: "hermes-kelly-25-sellier-rouge-casaque", title: "Kelly 25 Sellier", brand: "hermes", price: 2250000, condition: "excellent" as const, image: "1621735588289-30f4d7c6f31a", views: 3105, saves: 241 },
  { id: "jb-0005", slug: "louis-vuitton-pochette-metis-monogram", title: "Pochette Métis", brand: "louis-vuitton", price: 215000, condition: "excellent" as const, image: "1583623733237-4d5764a9dc82", views: 2210, saves: 198 },
];

function demoListings(): SellerListing[] {
  const live: SellerListing[] = DEMO_LIVE.map((p, i) => ({
    id: `l-${p.id}`,
    productId: p.id,
    productSlug: p.slug,
    title: p.title,
    brand: p.brand,
    category: "bags",
    price: p.price,
    condition: p.condition,
    size: "One size",
    image: assetKey(p.image),
    status: "active" as const,
    createdAt: daysAgo(3 + i * 4),
    views: p.views,
    saves: p.saves,
  }));
  return [
    ...live,
    {
      id: "l-pending-1",
      title: "Constance 18 Mini",
      brand: "hermes",
      category: "bags",
      price: 1450000,
      condition: "excellent",
      size: "One size",
      image: assetKey("1621735320154-dab9b96ba0e2"),
      status: "pending",
      createdAt: daysAgo(1),
      views: 0,
      saves: 0,
    },
    {
      id: "l-draft-1",
      title: "Boy Bag, Old Medium",
      brand: "chanel",
      category: "bags",
      price: 465000,
      condition: "very-good",
      size: "One size",
      image: assetKey("1736969373880-5ad57e1afb69"),
      status: "draft",
      createdAt: daysAgo(2),
      views: 0,
      saves: 0,
    },
    {
      id: "l-sold-1",
      title: "Lady Dior Mini, Lambskin",
      brand: "dior",
      category: "bags",
      price: 298000,
      condition: "excellent",
      size: "One size",
      image: assetKey("1647412983914-783bc576b456"),
      status: "sold",
      createdAt: daysAgo(26),
      views: 1840,
      saves: 160,
    },
    {
      id: "l-paused-1",
      title: "Twilly Set (2)",
      brand: "hermes",
      category: "accessories",
      price: 42000,
      condition: "new-with-tags",
      size: "One size",
      image: assetKey("1551028442-ee84b4d3a50a"),
      status: "paused",
      createdAt: daysAgo(40),
      views: 320,
      saves: 21,
    },
  ];
}

function demoOrders(): SellerOrder[] {
  return [
    {
      id: "SO-88213",
      listingTitle: "Kelly 25 Sellier",
      brand: "hermes",
      image: assetKey("1621735588289-30f4d7c6f31a"),
      buyerCity: "Bengaluru",
      amount: 2250000,
      payout: commissionFor(2250000).payout,
      status: "awaiting-dispatch",
      createdAt: daysAgo(0.3),
    },
    {
      id: "SO-88107",
      listingTitle: "Pochette Métis",
      brand: "louis-vuitton",
      image: assetKey("1583623733237-4d5764a9dc82"),
      buyerCity: "New Delhi",
      amount: 215000,
      payout: commissionFor(215000).payout,
      status: "authenticating",
      createdAt: daysAgo(2),
    },
    {
      id: "SO-87954",
      listingTitle: "Lady Dior Mini, Lambskin",
      brand: "dior",
      image: assetKey("1647412983914-783bc576b456"),
      buyerCity: "Hyderabad",
      amount: 298000,
      payout: commissionFor(298000).payout,
      status: "in-transit",
      createdAt: daysAgo(4),
    },
    {
      id: "SO-87612",
      listingTitle: "Speedy 30, Damier Ebène",
      brand: "louis-vuitton",
      image: assetKey("1691480288782-142b953cf664"),
      buyerCity: "Pune",
      amount: 124000,
      payout: commissionFor(124000).payout,
      status: "completed",
      createdAt: daysAgo(12),
    },
    {
      id: "SO-87230",
      listingTitle: "Carré 90 'Brides de Gala'",
      brand: "hermes",
      image: assetKey("1551028442-ee84b4d3a50a"),
      buyerCity: "Kolkata",
      amount: 36000,
      payout: commissionFor(36000).payout,
      status: "completed",
      createdAt: daysAgo(19),
    },
    {
      id: "SO-86901",
      listingTitle: "Evelyne 29",
      brand: "hermes",
      image: assetKey("1652427019217-3ded1a356f10"),
      buyerCity: "Chandigarh",
      amount: 412000,
      payout: commissionFor(412000).payout,
      status: "completed",
      createdAt: daysAgo(31),
    },
  ];
}

export const useSeller = create<SellerState>()(
  persist(
    (set) => ({
      profile: null,
      mode: "none",
      listings: [],
      orders: [],
      register: (profile) => set({ profile, mode: "registered", listings: [], orders: [] }),
      startDemo: () => set({ profile: DEMO_PROFILE, mode: "demo", listings: demoListings(), orders: demoOrders() }),
      signOut: () => set({ profile: null, mode: "none", listings: [], orders: [] }),
      addListing: (input) => {
        const listing: SellerListing = {
          ...input,
          id: uid("l-"),
          status: "pending",
          createdAt: new Date().toISOString(),
          views: 0,
          saves: 0,
        };
        set((s) => ({ listings: [listing, ...s.listings] }));
        return listing;
      },
      setListingStatus: (id, status) =>
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, status } : l)) })),
      setListingPrice: (id, price) =>
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, price } : l)) })),
      removeListing: (id) => set((s) => ({ listings: s.listings.filter((l) => l.id !== id) })),
      markDispatched: (id) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: "in-transit" } : o)) })),
    }),
    {
      name: "jb-seller",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
