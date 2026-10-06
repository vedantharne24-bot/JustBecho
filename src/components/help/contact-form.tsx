"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { isEmail, required, validate, type Errors } from "@/lib/validation";
import { uid, wait } from "@/lib/utils";

type Values = { name: string; email: string; topic: string; order: string; message: string };

export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", topic: "order", order: "", message: "" });
  const [errors, setErrors] = useState<Errors<Values>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [ticket, setTicket] = useState("");

  const set = (k: keyof Values, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(values, {
      name: required("Name"),
      email: (v) => (isEmail(v) ? null : "Enter a valid email"),
      message: (v) => (v.trim().length >= 20 ? null : "Tell us a little more (20 characters or more)"),
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    // Integration point: POST /api/support → help-desk (Zendesk, Freshdesk…)
    await wait(800);
    setTicket(uid("CC-").toUpperCase().slice(0, 9));
    setState("sent");
  };

  if (state === "sent") {
    return (
      <div className="border border-line p-8" role="status">
        <Check className="h-6 w-6 text-success" strokeWidth={1.5} />
        <p className="font-display mt-6 text-3xl">Message received.</p>
        <p className="mt-3 text-sm text-muted">
          Reference {ticket}. A member of client care will reply to {values.email} within two working hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
      <Field label="Name" htmlFor="c-name" error={errors.name}>
        <Input id="c-name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} />
      </Field>
      <Field label="Email" htmlFor="c-email" error={errors.email}>
        <Input id="c-email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} invalid={!!errors.email} />
      </Field>
      <Field label="Topic" htmlFor="c-topic">
        <NativeSelect id="c-topic" value={values.topic} onChange={(e) => set("topic", e.target.value)}>
          <option value="order">An order</option>
          <option value="authentication">Authentication</option>
          <option value="selling">Selling</option>
          <option value="returns">Returns</option>
          <option value="other">Something else</option>
        </NativeSelect>
      </Field>
      <Field label="Order number" htmlFor="c-order" optional>
        <Input id="c-order" value={values.order} onChange={(e) => set("order", e.target.value.toUpperCase())} placeholder="JB000000" />
      </Field>
      <Field label="How can we help?" htmlFor="c-message" error={errors.message} className="sm:col-span-2">
        <Textarea id="c-message" rows={5} value={values.message} onChange={(e) => set("message", e.target.value)} invalid={!!errors.message} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={state === "sending"}>
          Send message
        </Button>
      </div>
    </form>
  );
}
