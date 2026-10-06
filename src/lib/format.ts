const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

/** ₹14,25,000 — Indian digit grouping */
export function formatPrice(value: number): string {
  return inr.format(value);
}

/** ₹14.3L / ₹1.2Cr style compact amounts for dense UI */
export function formatPriceCompact(value: number): string {
  if (value >= 1_00_00_000) return `₹${trim(value / 1_00_00_000)} Cr`;
  if (value >= 1_00_000) return `₹${trim(value / 1_00_000)} L`;
  if (value >= 1_000) return `₹${trim(value / 1_000)}K`;
  return `₹${inrCompact.format(value)}`;
}

function trim(n: number): string {
  return n.toFixed(n >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatDay(iso: string | Date): string {
  return formatDate(iso, { weekday: "short", day: "numeric", month: "short", year: undefined });
}

export function formatTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(iso, { year: undefined });
}

export function percentOff(price: number, retail?: number): number | null {
  if (!retail || retail <= price) return null;
  return Math.round(((retail - price) / retail) * 100);
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
