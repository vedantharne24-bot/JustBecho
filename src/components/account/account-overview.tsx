"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { selectUnread, useAccount } from "@/store/account";
import { useWishlist } from "@/store/wishlist";
import { useHistory } from "@/store/history";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProducts } from "@/hooks/use-products";
import { formatDate } from "@/lib/format";
import { currentStage } from "@/lib/orders";
import { isEmail, isIndianMobile, required, validate, type Errors } from "@/lib/validation";
import { toast } from "@/store/toast";
import { Field, Input } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { Seal } from "@/components/ui/seal";
import { OrderCard } from "./order-card";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function AccountOverview() {
  const hydrated = useHydrated();
  const profile = useAccount((s) => s.profile);
  const orders = useAccount((s) => s.orders);
  const unread = useAccount(selectUnread);
  const saved = useWishlist((s) => s.ids.length);
  const viewed = useHistory((s) => s.viewed.length);
  const active = useMemo(() => orders.filter((o) => currentStage(o) !== "delivered"), [orders]);
  const ids = useMemo(() => [...new Set(orders.flatMap((o) => o.lines.map((l) => l.productId)))], [orders]);
  const { map } = useProducts(hydrated ? ids : []);

  if (!hydrated) {
    return (
      <div aria-busy className="flex flex-col gap-6">
        <div className="skeleton h-12 w-2/3" />
        <div className="skeleton h-56" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      <header>
        <p className="mono text-muted">{greeting()}</p>
        <h1 className="display-md mt-3">
          {profile.firstName} <em>{profile.lastName}.</em>
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="theme-dark grain relative col-span-full flex min-h-56 flex-col justify-between overflow-hidden p-6 sm:p-8 md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="mono text-muted">JustBecho</p>
              <p className="font-display mt-2 text-3xl italic">Collector</p>
            </div>
            <Seal className="w-20 text-champagne" />
          </div>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="mono tabular text-fg/80">JB · 0418 · {new Date(profile.memberSince).getFullYear()}</p>
              <p className="mt-1 text-xs text-muted">Member since {formatDate(profile.memberSince, { day: undefined })}</p>
            </div>
            <p className="max-w-[12rem] text-right text-xs text-muted">Priority authentication and early Vault access.</p>
          </div>
        </div>
        <dl className="col-span-full grid grid-cols-2 gap-4 md:col-span-2">
          {[
            { label: "Orders", value: orders.length, href: "/account/orders" },
            { label: "Saved", value: saved, href: "/account/wishlist" },
            { label: "Unread", value: unread, href: "/account/notifications" },
            { label: "Viewed", value: viewed, href: "/account/recently-viewed" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="group flex flex-col justify-between border border-line p-5 transition-colors hover:border-line-strong">
              <dt className="mono flex items-center justify-between text-muted">
                {s.label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
              </dt>
              <dd className="font-display tabular mt-6 text-4xl">{s.value}</dd>
            </Link>
          ))}
        </dl>
      </div>

      {active.length ? (
        <section aria-labelledby="active-orders">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 id="active-orders" className="title">
              In progress
            </h2>
            <Link href="/account/orders" className="label link-undraw text-muted">
              All orders
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {active.slice(0, 2).map((o) => (
              <OrderCard key={o.id} order={o} products={map} />
            ))}
          </div>
        </section>
      ) : null}

      <ProfileForm />
    </div>
  );
}

function ProfileForm() {
  const profile = useAccount((s) => s.profile);
  const update = useAccount((s) => s.updateProfile);
  const [values, setValues] = useState(profile);
  const [errors, setErrors] = useState<Errors<typeof profile>>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(profile);

  const set = (key: keyof typeof profile, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(values, {
      firstName: required("First name"),
      lastName: required("Last name"),
      email: (v) => (isEmail(String(v)) ? null : "Enter a valid email"),
      phone: (v) => (isIndianMobile(String(v)) ? null : "Enter a valid mobile number"),
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    update(values);
    setSaving(false);
    toast({ title: "Profile updated", tone: "success" });
  };

  return (
    <section aria-labelledby="profile-title" className="border-t border-line pt-10">
      <h2 id="profile-title" className="title">
        Personal details
      </h2>
      <form onSubmit={submit} noValidate className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
        <Field label="First name" htmlFor="p-first" error={errors.firstName}>
          <Input id="p-first" autoComplete="given-name" value={values.firstName} onChange={(e) => set("firstName", e.target.value)} invalid={!!errors.firstName} />
        </Field>
        <Field label="Last name" htmlFor="p-last" error={errors.lastName}>
          <Input id="p-last" autoComplete="family-name" value={values.lastName} onChange={(e) => set("lastName", e.target.value)} invalid={!!errors.lastName} />
        </Field>
        <Field label="Email" htmlFor="p-email" error={errors.email}>
          <Input id="p-email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} invalid={!!errors.email} />
        </Field>
        <Field label="Mobile" htmlFor="p-phone" error={errors.phone}>
          <Input id="p-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} invalid={!!errors.phone} />
        </Field>
        <Field label="City" htmlFor="p-city">
          <Input id="p-city" autoComplete="address-level2" value={values.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <div className="flex items-end gap-3 sm:col-span-2">
          <Button type="submit" disabled={!dirty} loading={saving}>
            Save changes
          </Button>
          {dirty ? (
            <Button type="button" variant="ghost" onClick={() => setValues(profile)}>
              Discard
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
