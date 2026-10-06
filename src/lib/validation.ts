export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isIndianMobile = (v: string) => /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v.trim());
export const isPincode = (v: string) => /^[1-9]\d{5}$/.test(v.trim());
export const isUpi = (v: string) => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());
export const isGstin = (v: string) => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.trim().toUpperCase());

export type Errors<T> = Partial<Record<keyof T, string>>;

/** Runs a map of field validators and returns only the failures. */
export function validate<T extends object>(
  values: T,
  rules: Partial<{ [K in keyof T]: (value: T[K], all: T) => string | null }>,
): Errors<T> {
  const errors: Errors<T> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const message = rules[key]?.(values[key], values);
    if (message) errors[key] = message;
  }
  return errors;
}

export const required = (label: string) => (v: unknown) =>
  typeof v === "string" ? (v.trim() ? null : `${label} is required`) : v ? null : `${label} is required`;
