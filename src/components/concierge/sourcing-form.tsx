"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { useAccount } from "@/store/account";
import { brands } from "@/lib/data/brands";
import { Field, Input, NativeSelect, Textarea, ChoiceCard } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { required, validate, type Errors } from "@/lib/validation";
import { cn, wait } from "@/lib/utils";

const BUDGETS = ["Under ₹1 L", "₹1 L – ₹5 L", "₹5 L – ₹20 L", "₹20 L – ₹1 Cr", "Above ₹1 Cr"];
const TIMELINES = ["As soon as possible", "Within a month", "Within three months", "No rush — the right one"];

type Values = { brand: string; model: string; details: string; budget: string; timeline: string; condition: string };

/** Sourcing requests: our specialists find a specific piece through private networks. */
export function SourcingForm() {
  const addRequest = useAccount((s) => s.addRequest);
  const pushNotification = useAccount((s) => s.pushNotification);
  const [values, setValues] = useState<Values>({ brand: "hermes", model: "", details: "", budget: BUDGETS[2], timeline: TIMELINES[2], condition: "excellent" });
  const [errors, setErrors] = useState<Errors<Values>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const set = <K extends keyof Values>(k: K, v: Values[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(values, { model: required("The piece you’re looking for") });
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    await wait(700);
    const brand = brands.find((b) => b.slug === values.brand)?.name ?? values.brand;
    addRequest({
      kind: "sourcing",
      title: `${brand} ${values.model.trim()}`,
      detail: [values.details.trim(), `${values.condition === "new" ? "New only" : values.condition === "excellent" ? "Excellent or better" : "Any condition"}`, values.budget, values.timeline]
        .filter(Boolean)
        .join(" · "),
    });
    pushNotification({ kind: "account", title: "Sourcing request received", body: `We're looking for ${brand} ${values.model.trim()}. A specialist will call within 24 hours.`, href: "/account/requests" });
    setState("sent");
  };

  if (state === "sent") {
    return (
      <div className="border border-line p-8 sm:p-10" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-fg">
          <Check className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <p className="font-display mt-8 text-4xl">We’re on it.</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          A sourcing specialist will call within 24 hours to confirm the details. Every piece we find goes through Becho
          Protect before it’s offered to you — with no obligation to buy.
        </p>
        <div className="mt-8 flex flex-wrap gap-5">
          <Link href="/account/requests" className="label link-undraw">
            Track your request
          </Link>
          <button type="button" onClick={() => setState("idle")} className="label link-undraw text-muted">
            Request another piece
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
      <Field label="House" htmlFor="src-brand">
        <NativeSelect id="src-brand" value={values.brand} onChange={(e) => set("brand", e.target.value)}>
          {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="The piece" htmlFor="src-model" error={errors.model} hint="Model, reference or colourway">
        <Input id="src-model" value={values.model} onChange={(e) => set("model", e.target.value)} invalid={!!errors.model} placeholder="e.g. Birkin 25, Gold, Togo" />
      </Field>
      <Field label="Anything else" htmlFor="src-details" optional className="sm:col-span-2">
        <Textarea id="src-details" rows={3} value={values.details} onChange={(e) => set("details", e.target.value)} placeholder="Hardware, year, size, must-have accessories…" />
      </Field>
      <Field label="Budget" htmlFor="src-budget">
        <NativeSelect id="src-budget" value={values.budget} onChange={(e) => set("budget", e.target.value)}>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Timeline" htmlFor="src-timeline">
        <NativeSelect id="src-timeline" value={values.timeline} onChange={(e) => set("timeline", e.target.value)}>
          {TIMELINES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </NativeSelect>
      </Field>
      <div className="sm:col-span-2">
        <p className="label mb-3 text-muted">Condition</p>
        <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3")}>
          <ChoiceCard name="cond" value="new" checked={values.condition === "new"} onChange={(v) => set("condition", v)} title="New only" description="Unworn, with tags" />
          <ChoiceCard name="cond" value="excellent" checked={values.condition === "excellent"} onChange={(v) => set("condition", v)} title="Excellent or better" description="Minimal signs of wear" />
          <ChoiceCard name="cond" value="any" checked={values.condition === "any"} onChange={(v) => set("condition", v)} title="Any condition" description="Priced accordingly" />
        </div>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" loading={state === "sending"}>
          Start the search
        </Button>
      </div>
    </form>
  );
}
