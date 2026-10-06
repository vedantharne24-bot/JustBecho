/** Seller commission schedule — tiered by sale price */
export const COMMISSION_TIERS = [
  { upTo: 50000, rate: 0.18, label: "Up to ₹50,000" },
  { upTo: 500000, rate: 0.12, label: "₹50,001 – ₹5,00,000" },
  { upTo: Infinity, rate: 0.08, label: "Above ₹5,00,000" },
];

export function commissionFor(price: number): { rate: number; fee: number; payout: number } {
  const tier = COMMISSION_TIERS.find((t) => price <= t.upTo) ?? COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
  const fee = Math.round(price * tier.rate);
  return { rate: tier.rate, fee, payout: price - fee };
}
