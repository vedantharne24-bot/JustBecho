"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Address, ConciergeRequest, Notification, Order } from "@/lib/types";
import { uid } from "@/lib/utils";

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  memberSince: string;
}

export interface Settings {
  emailUpdates: boolean;
  smsUpdates: boolean;
  whatsappUpdates: boolean;
  priceDrops: boolean;
  newArrivals: boolean;
  wishlistAlerts: boolean;
  privateProfile: boolean;
}

interface AccountState {
  profile: Profile;
  addresses: Address[];
  settings: Settings;
  notifications: Notification[];
  orders: Order[];
  requests: ConciergeRequest[];
  addRequest: (r: Omit<ConciergeRequest, "id" | "createdAt" | "status">) => ConciergeRequest;
  updateProfile: (patch: Partial<Profile>) => void;
  saveAddress: (address: Omit<Address, "id"> & { id?: string }) => Address;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  placeOrder: (order: Order) => void;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const HOME: Address = {
  id: "addr-home",
  label: "Home",
  name: "Aarav Mehta",
  phone: "+91 98200 41377",
  line1: "Flat 1402, Altamount Heights",
  line2: "Altamount Road, Cumballa Hill",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400026",
  isDefault: true,
};

const OFFICE: Address = {
  id: "addr-office",
  label: "Office",
  name: "Aarav Mehta",
  phone: "+91 98200 41377",
  line1: "Level 9, Tower B, One BKC",
  line2: "Bandra Kurla Complex, Bandra East",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400051",
  isDefault: false,
};

function seedOrders(): Order[] {
  // Seed references by catalogue id — kept inline so the client bundle doesn't carry the catalogue
  const marmont = { id: "jb-0008", price: 105000 };
  const taxi = { id: "jb-0033", price: 28900 };
  const tank = { id: "jb-0025", size: "33.7 mm" };
  return [
    {
      id: "JB517324",
      createdAt: hoursAgo(58),
      lines: [{ productId: taxi.id, size: "UK 9", quantity: 1, price: taxi.price }],
      address: HOME,
      delivery: "standard",
      payment: "upi",
      subtotal: taxi.price,
      shipping: 0,
      protectFee: 999,
      gst: 180,
      total: taxi.price + 999 + 180,
      estimatedDelivery: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    },
    {
      id: "JB482910",
      createdAt: "2026-09-12T10:24:00.000Z",
      lines: [{ productId: marmont.id, size: "One size", quantity: 1, price: marmont.price }],
      address: HOME,
      delivery: "express",
      payment: "card",
      subtotal: marmont.price,
      shipping: 1499,
      protectFee: 0,
      gst: 270,
      total: marmont.price + 1499 + 270,
      stage: "delivered",
      estimatedDelivery: "2026-09-16T10:00:00.000Z",
    },
    {
      id: "JB455067",
      createdAt: "2026-08-02T15:02:00.000Z",
      lines: [{ productId: tank.id, size: tank.size, quantity: 1, price: 258000 }],
      address: OFFICE,
      delivery: "standard",
      payment: "emi",
      subtotal: 258000,
      shipping: 0,
      protectFee: 0,
      gst: 0,
      total: 258000,
      stage: "delivered",
      estimatedDelivery: "2026-08-09T10:00:00.000Z",
    },
  ];
}

function seedNotifications(): Notification[] {
  return [
    {
      id: "n1",
      kind: "order",
      title: "Authentication has begun",
      body: "Your Air Jordan 1 'Taxi' arrived at the Becho Hub and is with our sneaker specialists.",
      createdAt: hoursAgo(6),
      read: false,
      href: "/account/orders/JB517324",
    },
    {
      id: "n2",
      kind: "price",
      title: "Price drop on a saved piece",
      body: "Santos de Cartier, Medium is now ₹6,40,000 — ₹35,000 lower than last week.",
      createdAt: hoursAgo(27),
      read: false,
      href: "/product/cartier-santos-de-cartier-medium",
    },
    {
      id: "n3",
      kind: "editorial",
      title: "The Vault is open",
      body: "A Nautilus 5711, a Royal Oak in pink gold and an Off-White Chicago joined this week.",
      createdAt: hoursAgo(52),
      read: true,
      href: "/explore?min=200000&sort=price-desc",
    },
    {
      id: "n4",
      kind: "wishlist",
      title: "Someone else saved your Kelly",
      body: "The Kelly 28 Sellier in Bleu Paon has been saved 388 times. It's one of a kind.",
      createdAt: hoursAgo(80),
      read: true,
      href: "/product/hermes-kelly-28-sellier-bleu-paon",
    },
    {
      id: "n5",
      kind: "account",
      title: "Certificate added to your account",
      body: "The digital certificate for your GG Marmont (JB-BG-20696) is ready to download.",
      createdAt: "2026-09-16T12:00:00.000Z",
      read: true,
      href: "/account/orders/JB482910",
    },
  ];
}

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      profile: {
        firstName: "Aarav",
        lastName: "Mehta",
        email: "aarav.mehta@email.com",
        phone: "+91 98200 41377",
        city: "Mumbai",
        memberSince: "2024-03-18",
      },
      addresses: [HOME, OFFICE],
      settings: {
        emailUpdates: true,
        smsUpdates: false,
        whatsappUpdates: true,
        priceDrops: true,
        newArrivals: true,
        wishlistAlerts: true,
        privateProfile: false,
      },
      notifications: seedNotifications(),
      orders: seedOrders(),
      requests: [
        {
          id: "rq-seed-1",
          kind: "sourcing",
          createdAt: hoursAgo(120),
          status: "in-progress",
          title: "Hermès Birkin 25 in Gold, Togo",
          detail: "Gold hardware preferred · Excellent or better · Budget up to ₹22 L · Within 3 months",
        },
      ],

      addRequest: (input) => {
        const request: ConciergeRequest = { ...input, id: uid("rq-"), createdAt: new Date().toISOString(), status: "received" };
        set((s) => ({ requests: [request, ...s.requests] }));
        return request;
      },

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      saveAddress: (input) => {
        const address: Address = { ...input, id: input.id ?? uid("addr-") };
        set((s) => {
          let list = s.addresses.some((a) => a.id === address.id)
            ? s.addresses.map((a) => (a.id === address.id ? address : a))
            : [...s.addresses, address];
          if (address.isDefault || list.length === 1) {
            list = list.map((a) => ({ ...a, isDefault: a.id === address.id }));
          }
          return { addresses: list };
        });
        return address;
      },
      removeAddress: (id) =>
        set((s) => {
          const remaining = s.addresses.filter((a) => a.id !== id);
          if (remaining.length && !remaining.some((a) => a.isDefault)) remaining[0] = { ...remaining[0], isDefault: true };
          return { addresses: remaining };
        }),
      setDefaultAddress: (id) =>
        set((s) => ({ addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      markRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      pushNotification: (n) =>
        set((s) => ({
          notifications: [{ ...n, id: uid("n-"), createdAt: new Date().toISOString(), read: false }, ...s.notifications],
        })),

      placeOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    {
      name: "jb-account",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export const selectUnread = (s: AccountState) => s.notifications.filter((n) => !n.read).length;
