"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, ArrowRight, Building2, UserRound } from "lucide-react";
import { useSeller, type SellerProfile } from "@/store/seller";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "@/store/toast";
import { categories } from "@/lib/data/categories";
import { ease } from "@/lib/motion";
import { cn, wait } from "@/lib/utils";
import { isEmail, isGstin, isIndianMobile, isPincode, isUpi, required, validate, type Errors } from "@/lib/validation";
import { Steps } from "@/components/ui/steps";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, ChoiceCard, Field, Input } from "@/components/ui/fields";

const STEPS = ["You", "Your store", "Payouts", "Agreement"];

type Values = SellerProfile & { agreeTerms: boolean; agreeAuthentic: boolean };

const EMPTY: Values = {
  storeName: "",
  fullName: "",
  email: "",
  phone: "",
  type: "individual",
  city: "",
  pincode: "",
  upi: "",
  gstin: "",
  categories: [],
  agreeTerms: false,
  agreeAuthentic: false,
};

export function SellerRegistration() {
  const router = useRouter();
  const hydrated = useHydrated();
  const mode = useSeller((s) => s.mode);
  const register = useSeller((s) => s.register);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors<Values>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const checkStep = (i: number): Errors<Values> => {
    if (i === 0)
      return validate(values, {
        fullName: required("Full name"),
        email: (v) => (isEmail(String(v)) ? null : "Enter a valid email"),
        phone: (v) => (isIndianMobile(String(v)) ? null : "Enter a valid 10-digit mobile number"),
      });
    if (i === 1)
      return validate(values, {
        storeName: (v) => (String(v).trim().length >= 3 ? null : "Store name needs at least 3 characters"),
        city: required("City"),
        pincode: (v) => (isPincode(String(v)) ? null : "Enter a valid 6-digit pincode"),
        categories: (v) => ((v as string[]).length ? null : "Choose at least one category"),
      });
    if (i === 2)
      return validate(values, {
        upi: (v) => (isUpi(String(v)) ? null : "Enter a valid UPI ID, e.g. name@okhdfc"),
        gstin: (v, all) =>
          all.type === "boutique"
            ? isGstin(String(v ?? ""))
              ? null
              : "A valid GSTIN is required for boutiques"
            : v && !isGstin(String(v))
              ? "That GSTIN doesn’t look right"
              : null,
      });
    return validate(values, {
      agreeTerms: (v) => (v ? null : "Please accept the seller terms"),
      agreeAuthentic: (v) => (v ? null : "Please confirm this declaration"),
    });
  };

  const next = async () => {
    const e = checkStep(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    await wait(900);
    const { agreeTerms: _t, agreeAuthentic: _a, ...profile } = values;
    void _t;
    void _a;
    register({ ...profile, gstin: profile.gstin?.toUpperCase() || undefined, storeName: profile.storeName.trim() });
    toast({ title: `Welcome, ${profile.fullName.split(" ")[0]}`, description: "Your seller account is ready.", tone: "success" });
    router.push("/seller");
  };

  if (hydrated && mode === "registered") {
    return (
      <div className="border border-line p-8 text-center sm:p-12">
        <p className="display-sm">You’re already a seller.</p>
        <p className="mt-3 text-sm text-muted">Head to your dashboard to list a piece or manage orders.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/seller">Open dashboard</ButtonLink>
          <ButtonLink href="/seller/new" variant="outline">
            New listing
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Steps steps={STEPS} current={step} onSelect={setStep} />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="mt-12"
      >
        <AnimatePresence mode="wait">
          <m.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.45, ease: ease.out } }}
            exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
          >
            {step === 0 ? (
              <fieldset>
                <legend className="display-sm">Tell us about you.</legend>
                <p className="mt-3 text-sm text-muted">We use these details to verify sellers and keep payouts secure.</p>
                <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="r-name" error={errors.fullName} className="sm:col-span-2">
                    <Input id="r-name" autoComplete="name" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} invalid={!!errors.fullName} />
                  </Field>
                  <Field label="Email" htmlFor="r-email" error={errors.email}>
                    <Input id="r-email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} invalid={!!errors.email} />
                  </Field>
                  <Field label="Mobile" htmlFor="r-phone" error={errors.phone} hint="We’ll verify this by OTP before your first payout">
                    <Input id="r-phone" type="tel" autoComplete="tel" placeholder="+91" value={values.phone} onChange={(e) => set("phone", e.target.value)} invalid={!!errors.phone} />
                  </Field>
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <fieldset>
                <legend className="display-sm">Your store.</legend>
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ChoiceCard
                    name="type"
                    value="individual"
                    checked={values.type === "individual"}
                    onChange={() => set("type", "individual")}
                    title={
                      <span className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" strokeWidth={1.25} /> Private seller
                      </span>
                    }
                    description="Selling pieces from your own wardrobe or collection."
                  />
                  <ChoiceCard
                    name="type"
                    value="boutique"
                    checked={values.type === "boutique"}
                    onChange={() => set("type", "boutique")}
                    title={
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" strokeWidth={1.25} /> Boutique or reseller
                      </span>
                    }
                    description="A registered business with GST. Bulk tools included."
                  />
                </div>
                <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                  <Field label="Store name" htmlFor="r-store" error={errors.storeName} hint="Shown to buyers on your listings" className="sm:col-span-2">
                    <Input id="r-store" value={values.storeName} onChange={(e) => set("storeName", e.target.value)} invalid={!!errors.storeName} placeholder={values.type === "boutique" ? "e.g. The Archive Bombay" : "e.g. Kiara’s Closet"} />
                  </Field>
                  <Field label="City" htmlFor="r-city" error={errors.city}>
                    <Input id="r-city" autoComplete="address-level2" value={values.city} onChange={(e) => set("city", e.target.value)} invalid={!!errors.city} />
                  </Field>
                  <Field label="Pickup pincode" htmlFor="r-pincode" error={errors.pincode}>
                    <Input id="r-pincode" inputMode="numeric" maxLength={6} value={values.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} invalid={!!errors.pincode} />
                  </Field>
                </div>
                <div className="mt-10">
                  <p className="label text-muted">What will you sell?</p>
                  <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Categories">
                    {categories.map((c) => {
                      const on = values.categories.includes(c.slug);
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          aria-pressed={on}
                          onClick={() => set("categories", on ? values.categories.filter((x) => x !== c.slug) : [...values.categories, c.slug])}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-colors",
                            on ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
                          )}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.categories ? (
                    <p role="alert" className="mt-3 text-xs text-error">
                      {errors.categories}
                    </p>
                  ) : null}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <fieldset>
                <legend className="display-sm">Getting paid.</legend>
                <p className="mt-3 text-sm text-muted">
                  Payouts arrive within 48 hours of delivery. Bank details are verified by our payments partner — we never
                  store them in plain text.
                </p>
                <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                  <Field label="UPI ID for payouts" htmlFor="r-upi" error={errors.upi} className="sm:col-span-2">
                    <Input id="r-upi" autoComplete="off" placeholder="yourname@okhdfc" value={values.upi} onChange={(e) => set("upi", e.target.value)} invalid={!!errors.upi} />
                  </Field>
                  <Field
                    label="GSTIN"
                    htmlFor="r-gstin"
                    optional={values.type === "individual"}
                    error={errors.gstin}
                    hint={values.type === "boutique" ? "Required for GST invoicing" : "Only if you’re GST-registered"}
                    className="sm:col-span-2"
                  >
                    <Input id="r-gstin" value={values.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} invalid={!!errors.gstin} maxLength={15} />
                  </Field>
                </div>
              </fieldset>
            ) : null}

            {step === 3 ? (
              <fieldset>
                <legend className="display-sm">Before you begin.</legend>
                <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-y border-line py-6 text-sm sm:grid-cols-2">
                  {[
                    ["Name", values.fullName],
                    ["Store", values.storeName],
                    ["Type", values.type === "boutique" ? "Boutique" : "Private seller"],
                    ["City", `${values.city} ${values.pincode}`],
                    ["Payouts", values.upi],
                    ["Selling", values.categories.map((c) => categories.find((x) => x.slug === c)?.name).join(", ")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 sm:block">
                      <dt className="label text-muted">{k}</dt>
                      <dd className="sm:mt-1">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 flex flex-col gap-2">
                  <Checkbox
                    checked={values.agreeTerms}
                    onChange={(v) => set("agreeTerms", v)}
                    label={
                      <span>
                        I agree to the{" "}
                        <Link href="/help#terms" className="underline underline-offset-2">
                          Seller Terms
                        </Link>{" "}
                        and the commission schedule.
                      </span>
                    }
                  />
                  {errors.agreeTerms ? <p role="alert" className="pl-7 text-xs text-error">{errors.agreeTerms}</p> : null}
                  <Checkbox
                    checked={values.agreeAuthentic}
                    onChange={(v) => set("agreeAuthentic", v)}
                    label="I will only list authentic pieces that I own, and I understand counterfeit listings are removed and reported."
                  />
                  {errors.agreeAuthentic ? <p role="alert" className="pl-7 text-xs text-error">{errors.agreeAuthentic}</p> : null}
                </div>
              </fieldset>
            ) : null}
          </m.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between border-t border-line pt-8">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="label flex items-center gap-2 text-muted hover:text-fg">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.25} /> Back
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" loading={submitting} icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
            {step === STEPS.length - 1 ? "Create seller account" : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
