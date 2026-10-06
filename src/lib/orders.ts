import type { DeliveryMethod, Order, OrderStage } from "@/lib/types";
import { addBusinessDays } from "@/lib/utils";

export interface StageMeta {
  stage: OrderStage;
  label: string;
  description: string;
  /** Hours after the order is placed when this stage is typically reached */
  offsetHours: number;
}

export const ORDER_STAGES: StageMeta[] = [
  { stage: "placed", label: "Order placed", description: "Payment received and the piece is reserved for you.", offsetHours: 0 },
  { stage: "confirmed", label: "Seller confirmed", description: "The seller has confirmed availability and is preparing dispatch.", offsetHours: 4 },
  { stage: "shipped-to-hub", label: "Shipped to Becho Hub", description: "On its way to our Mumbai authentication centre, recorded on video at packing.", offsetHours: 26 },
  { stage: "authenticating", label: "Authentication", description: "Specialists are inspecting materials, serials and construction.", offsetHours: 50 },
  { stage: "approved", label: "Approved & sealed", description: "Passed every check. Sealed with a tamper-evident Becho Protect tag.", offsetHours: 74 },
  { stage: "out-for-delivery", label: "Out for delivery", description: "With our insured courier partner. OTP required on delivery.", offsetHours: 104 },
  { stage: "delivered", label: "Delivered", description: "Signed for. Your certificate of authenticity is in your account.", offsetHours: 124 },
];

export const stageIndex = (stage: OrderStage) => ORDER_STAGES.findIndex((s) => s.stage === stage);

const EXPRESS_FACTOR = 0.6;

export function stageTimes(order: Pick<Order, "createdAt" | "delivery">): Date[] {
  const start = new Date(order.createdAt).getTime();
  const factor = order.delivery === "express" ? EXPRESS_FACTOR : 1;
  return ORDER_STAGES.map((s) => new Date(start + s.offsetHours * factor * 3_600_000));
}

/** Current stage of an order: fixed for archived orders, time-derived for live ones */
export function currentStage(order: Order, now = Date.now()): OrderStage {
  if (order.stage) return order.stage;
  const times = stageTimes(order);
  let current: OrderStage = "placed";
  times.forEach((t, i) => {
    if (t.getTime() <= now) current = ORDER_STAGES[i].stage;
  });
  return current;
}

export function deliveryWindow(method: DeliveryMethod, from = new Date()): { start: Date; end: Date } {
  return method === "express"
    ? { start: addBusinessDays(from, 3), end: addBusinessDays(from, 4) }
    : { start: addBusinessDays(from, 5), end: addBusinessDays(from, 7) };
}

export const DELIVERY_OPTIONS: {
  value: DeliveryMethod;
  label: string;
  description: string;
  price: number;
}[] = [
  {
    value: "standard",
    label: "Insured standard",
    description: "Authenticated, sealed and delivered by our insured courier.",
    price: 0,
  },
  {
    value: "express",
    label: "Priority authentication",
    description: "Your piece jumps the authentication queue and ships by air.",
    price: 1499,
  },
];

/* Pricing rules — mirrored server-side when checkout moves to the API */
export const PROTECT_FEE = 999;
export const PROTECT_INCLUDED_ABOVE = 100000;
/** GST is levied on JustBecho service fees (Protect, priority delivery), not on the pre-owned goods themselves */
export const GST_RATE = 0.18;

export function protectFeeFor(price: number, enabled: boolean): number {
  if (price >= PROTECT_INCLUDED_ABOVE) return 0;
  return enabled ? PROTECT_FEE : 0;
}

export function newOrderId(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `JB${n}`;
}
