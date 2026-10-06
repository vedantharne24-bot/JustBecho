"use client";

import { useState } from "react";
import type { Address } from "@/lib/types";
import { Field, Input, NativeSelect, Checkbox } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES, isIndianMobile, isPincode, required, validate, type Errors } from "@/lib/validation";

type Values = Omit<Address, "id">;

const EMPTY: Values = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "Maharashtra",
  pincode: "",
  isDefault: false,
};

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save address",
}: {
  initial?: Partial<Address>;
  onSubmit: (values: Values) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Values>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Errors<Values>>({});

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(values, {
      name: required("Full name"),
      phone: (v) => (isIndianMobile(String(v)) ? null : "Enter a valid 10-digit mobile number"),
      line1: required("Address"),
      city: required("City"),
      state: required("State"),
      pincode: (v) => (isPincode(String(v)) ? null : "Enter a valid 6-digit pincode"),
    });
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(`addr-${first}`)?.focus();
      return;
    }
    onSubmit({ ...values, name: values.name.trim(), city: values.city.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
      <div className="flex gap-2 sm:col-span-2" role="radiogroup" aria-label="Address label">
        {["Home", "Office", "Other"].map((label) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={values.label === label}
            onClick={() => set("label", label)}
            className={
              values.label === label
                ? "rounded-full border border-fg bg-fg px-4 py-1.5 text-xs text-bg"
                : "rounded-full border border-line px-4 py-1.5 text-xs hover:border-fg"
            }
          >
            {label}
          </button>
        ))}
      </div>
      <Field label="Full name" htmlFor="addr-name" error={errors.name}>
        <Input id="addr-name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} />
      </Field>
      <Field label="Mobile" htmlFor="addr-phone" error={errors.phone} hint="For delivery OTP">
        <Input
          id="addr-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          invalid={!!errors.phone}
        />
      </Field>
      <Field label="Flat, house, building" htmlFor="addr-line1" error={errors.line1} className="sm:col-span-2">
        <Input id="addr-line1" autoComplete="address-line1" value={values.line1} onChange={(e) => set("line1", e.target.value)} invalid={!!errors.line1} />
      </Field>
      <Field label="Area, street, landmark" htmlFor="addr-line2" optional className="sm:col-span-2">
        <Input id="addr-line2" autoComplete="address-line2" value={values.line2} onChange={(e) => set("line2", e.target.value)} />
      </Field>
      <Field label="City" htmlFor="addr-city" error={errors.city}>
        <Input id="addr-city" autoComplete="address-level2" value={values.city} onChange={(e) => set("city", e.target.value)} invalid={!!errors.city} />
      </Field>
      <Field label="Pincode" htmlFor="addr-pincode" error={errors.pincode}>
        <Input
          id="addr-pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={values.pincode}
          onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
          invalid={!!errors.pincode}
        />
      </Field>
      <Field label="State" htmlFor="addr-state" error={errors.state} className="sm:col-span-2">
        <NativeSelect id="addr-state" autoComplete="address-level1" value={values.state} onChange={(e) => set("state", e.target.value)}>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <div className="sm:col-span-2">
        <Checkbox checked={values.isDefault} onChange={(v) => set("isDefault", v)} label="Make this my default address" />
      </div>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Button type="submit">{submitLabel}</Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
