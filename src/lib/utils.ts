import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function uid(prefix = ""): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}${random}`;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toArray<T extends string>(value: string | string[] | undefined | null): T[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : value.split(",");
  return list.map((v) => v.trim()).filter(Boolean) as T[];
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Skip Sundays when estimating courier delivery dates */
export function addBusinessDays(date: Date, days: number): Date {
  const next = new Date(date);
  let added = 0;
  while (added < days) {
    next.setDate(next.getDate() + 1);
    if (next.getDay() !== 0) added += 1;
  }
  return next;
}
