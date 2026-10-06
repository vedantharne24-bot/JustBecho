import type { PaymentMethod } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────────
   Payments integration boundary.

   Checkout never touches card numbers or bank credentials. A production
   provider (Razorpay, Stripe, Cashfree…) creates a server-side order, then
   the client opens the provider's hosted checkout and receives a signed
   result that the server verifies before the order is confirmed.

   `createCheckoutSession` is the single seam. Swap `demoProvider` for a real
   implementation that calls `/api/payments/session` and opens the hosted
   checkout; nothing else in the UI needs to change.
   ────────────────────────────────────────────────────────────────────────── */

export interface CheckoutSessionInput {
  orderId: string;
  amount: number; // in rupees
  currency: "INR";
  method: PaymentMethod;
  customer: { name: string; email: string; phone: string };
}

export type CheckoutSessionResult =
  | { status: "confirmed"; reference: string; mode: "demo" | "live" }
  | { status: "cancelled" }
  | { status: "failed"; reason: string };

export interface PaymentProvider {
  name: string;
  mode: "demo" | "live";
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
}

/**
 * Demo provider: no payment is attempted or simulated. It confirms the order
 * so the post-purchase experience can be reviewed end to end.
 */
const demoProvider: PaymentProvider = {
  name: "Demo",
  mode: "demo",
  async createCheckoutSession(input) {
    await new Promise((r) => setTimeout(r, 900));
    return { status: "confirmed", reference: `demo_${input.orderId}`, mode: "demo" };
  },
};

export const paymentProvider: PaymentProvider = demoProvider;

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "upi", label: "UPI", description: "Google Pay, PhonePe, Paytm or any UPI app" },
  { value: "card", label: "Credit or debit card", description: "Visa, Mastercard, RuPay, Amex" },
  { value: "netbanking", label: "Net banking", description: "All major Indian banks" },
  { value: "emi", label: "No-cost EMI", description: "3, 6 or 9 months on eligible cards" },
];
