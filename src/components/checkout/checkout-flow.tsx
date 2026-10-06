"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, ArrowRight, Info, Lock, Pencil, Plus, ShieldCheck } from "lucide-react";
import type { DeliveryMethod, Order, PaymentMethod } from "@/lib/types";
import { useAccount } from "@/store/account";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartSummary } from "@/hooks/use-cart-summary";
import { DELIVERY_OPTIONS, deliveryWindow, newOrderId } from "@/lib/orders";
import { PAYMENT_METHODS, paymentProvider } from "@/lib/payments";
import { formatDay, formatPrice } from "@/lib/format";
import { productDisplayName } from "@/lib/data/brands";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { scrollToTarget } from "@/lib/lenis";
import { Steps } from "@/components/ui/steps";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceCard, Checkbox } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/misc";
import { AddressForm } from "@/components/account/address-form";
import { SummaryItems, SummaryLines, TrustNotes } from "@/components/cart/order-summary";

const STEPS = ["Address", "Delivery", "Review", "Payment"];

export function CheckoutFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const addresses = useAccount((s) => s.addresses);
  const profile = useAccount((s) => s.profile);
  const saveAddress = useAccount((s) => s.saveAddress);
  const placeOrder = useAccount((s) => s.placeOrder);
  const pushNotification = useAccount((s) => s.pushNotification);
  const clearCart = useCart((s) => s.clear);

  const [step, setStep] = useState(0);
  const [chosenAddressId, setAddressId] = useState<string | null>(null);
  const [addingNew, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const summary = useCartSummary(delivery);
  // Default to the saved default address; show the form when there are none
  const addressId = chosenAddressId ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
  const adding = addingNew || (hydrated && addresses.length === 0);
  const address = addresses.find((a) => a.id === addressId) ?? null;

  const windows = useMemo(
    () => Object.fromEntries(DELIVERY_OPTIONS.map((d) => [d.value, deliveryWindow(d.value)])),
    [],
  ) as Record<DeliveryMethod, { start: Date; end: Date }>;

  const goTo = (next: number) => {
    setStep(next);
    scrollToTarget(0, { immediate: false });
  };

  const place = async () => {
    if (!agreed) {
      setAgreeError(true);
      return;
    }
    if (!address) return;
    setPlacing(true);
    setFailure(null);
    const orderId = newOrderId();
    const result = await paymentProvider.createCheckoutSession({
      orderId,
      amount: summary.total,
      currency: "INR",
      method: payment,
      customer: { name: `${profile.firstName} ${profile.lastName}`, email: profile.email, phone: profile.phone },
    });

    if (result.status !== "confirmed") {
      setPlacing(false);
      setFailure(result.status === "failed" ? result.reason : "Payment was cancelled. Your bag is unchanged.");
      return;
    }

    const order: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      lines: summary.purchasable.map((r) => ({ productId: r.productId, size: r.size, quantity: r.quantity, price: r.product.price })),
      address,
      delivery,
      payment,
      subtotal: summary.subtotal,
      shipping: summary.shipping,
      protectFee: summary.protect,
      gst: summary.gst,
      total: summary.total,
      estimatedDelivery: windows[delivery].end.toISOString(),
    };
    placeOrder(order);
    pushNotification({
      kind: "order",
      title: `Order ${orderId} confirmed`,
      body: `${summary.purchasable.map((r) => productDisplayName(r.product)).join(", ")} — we’ve asked the seller to dispatch to the Becho Hub.`,
      href: `/account/orders/${orderId}`,
    });
    router.push(`/checkout/success?order=${orderId}`);
    // Clear after navigation starts so the summary doesn't flash empty
    setTimeout(clearCart, 400);
  };

  if (!hydrated || summary.loading) {
    return (
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12" aria-busy>
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
        <div className="skeleton h-80 lg:col-span-5" />
      </div>
    );
  }

  if (summary.purchasable.length === 0 && !placing) {
    return (
      <EmptyState
        title="There’s nothing to check out."
        description="Your bag is empty — or the pieces in it have just sold."
        action={<ButtonLink href="/explore">Continue shopping</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <Steps steps={STEPS} current={step} onSelect={goTo} />

        <div className="mt-12 min-h-[24rem]">
          <AnimatePresence mode="wait">
            <m.section
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } }}
              exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
              aria-labelledby={`step-${step}`}
            >
              {step === 0 ? (
                <div>
                  <StepTitle id="step-0" index={1} title="Where should it go?" />
                  <p className="mt-3 text-sm text-muted">
                    Order updates go to {profile.email} and {profile.phone}.
                  </p>
                  {!adding ? (
                    <div className="mt-8 flex flex-col gap-3">
                      {addresses.map((a) => (
                        <ChoiceCard
                          key={a.id}
                          name="address"
                          value={a.id}
                          checked={addressId === a.id}
                          onChange={setAddressId}
                          title={
                            <span className="flex items-center gap-3">
                              {a.label}
                              {a.isDefault ? <span className="mono text-subtle">Default</span> : null}
                            </span>
                          }
                          description={
                            <>
                              {a.name} · {a.phone}
                              <br />
                              {a.line1}
                              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                            </>
                          }
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="label flex items-center gap-2 border border-dashed border-line-strong p-5 text-muted transition-colors hover:border-fg hover:text-fg"
                      >
                        <Plus className="h-4 w-4" strokeWidth={1.25} />
                        Add a new address
                      </button>
                    </div>
                  ) : (
                    <div className="mt-8 border border-line p-5 sm:p-8">
                      <p className="label mb-6">New address</p>
                      <AddressForm
                        initial={{ name: `${profile.firstName} ${profile.lastName}`, phone: profile.phone, isDefault: addresses.length === 0 }}
                        submitLabel="Use this address"
                        onCancel={addresses.length ? () => setAdding(false) : undefined}
                        onSubmit={(values) => {
                          const saved = saveAddress(values);
                          setAddressId(saved.id);
                          setAdding(false);
                        }}
                      />
                    </div>
                  )}
                  {!adding ? (
                    <div className="mt-10 flex justify-end">
                      <Button onClick={() => goTo(1)} disabled={!address} icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
                        Continue to delivery
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <StepTitle id="step-1" index={2} title="How fast?" />
                  <p className="mt-3 text-sm text-muted">
                    Dates include authentication at the Becho Hub. Delivering to {address?.city} {address?.pincode}.
                  </p>
                  <div className="mt-8 flex flex-col gap-3">
                    {DELIVERY_OPTIONS.map((d) => (
                      <ChoiceCard
                        key={d.value}
                        name="delivery"
                        value={d.value}
                        checked={delivery === d.value}
                        onChange={(v) => setDelivery(v as DeliveryMethod)}
                        title={
                          <span>
                            {d.label}
                            <span className="ml-3 text-muted">
                              {formatDay(windows[d.value].start)} – {formatDay(windows[d.value].end)}
                            </span>
                          </span>
                        }
                        description={d.description}
                        aside={d.price ? formatPrice(d.price) : "Free"}
                      />
                    ))}
                  </div>
                  <StepNav onBack={() => goTo(0)} onNext={() => goTo(2)} next="Review order" />
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <StepTitle id="step-2" index={3} title="One last look." />
                  <div className="mt-8 divide-y divide-line border-y border-line">
                    <ReviewRow label="Deliver to" onEdit={() => goTo(0)}>
                      {address?.name}, {address?.line1}, {address?.city} {address?.pincode}
                    </ReviewRow>
                    <ReviewRow label="Delivery" onEdit={() => goTo(1)}>
                      {DELIVERY_OPTIONS.find((d) => d.value === delivery)?.label} · arrives {formatDay(windows[delivery].start)} –{" "}
                      {formatDay(windows[delivery].end)}
                    </ReviewRow>
                    <ReviewRow label="Pieces" onEdit={() => router.push("/cart")} editLabel="Edit bag">
                      <ul className="flex flex-col gap-1">
                        {summary.purchasable.map((r) => (
                          <li key={r.productId + r.size} className="flex justify-between gap-4">
                            <span>
                              {productDisplayName(r.product)} · {r.size}
                              {r.quantity > 1 ? ` × ${r.quantity}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </ReviewRow>
                    <ReviewRow label="Becho Protect">
                      <span className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.25} />
                        {summary.purchasable.every((r) => r.protect || r.protectIncluded)
                          ? "Every piece will be authenticated and sealed before dispatch."
                          : "Some pieces ship without authentication. You can add Protect from your bag."}
                      </span>
                    </ReviewRow>
                  </div>
                  <StepNav onBack={() => goTo(1)} onNext={() => goTo(3)} next="Continue to payment" />
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <StepTitle id="step-3" index={4} title="Payment." />
                  <div className="mt-8 flex flex-col gap-3">
                    {PAYMENT_METHODS.map((p) => (
                      <ChoiceCard
                        key={p.value}
                        name="payment"
                        value={p.value}
                        checked={payment === p.value}
                        onChange={(v) => setPayment(v as PaymentMethod)}
                        title={p.label}
                        description={p.description}
                        disabled={p.value === "emi" && summary.total < 10000}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3 border border-line bg-surface-2 p-5 text-xs leading-relaxed text-muted">
                    <Lock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-fg" strokeWidth={1.25} />
                    <p>
                      You’ll complete payment in our payment partner’s secure window. JustBecho never sees your card or bank
                      details.
                      {paymentProvider.mode === "demo" ? (
                        <span className="mt-2 flex items-center gap-1.5 text-fg">
                          <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Preview mode — no payment partner is connected and no money will be taken.
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="mt-6">
                    <Checkbox
                      checked={agreed}
                      onChange={(v) => {
                        setAgreed(v);
                        setAgreeError(false);
                      }}
                      label={
                        <span>
                          I agree to the{" "}
                          <Link href="/help#terms" className="underline underline-offset-2">
                            Buyer Terms
                          </Link>{" "}
                          and the Becho Protect authentication policy.
                        </span>
                      }
                    />
                    {agreeError ? (
                      <p role="alert" className="mt-2 text-xs text-error">
                        Please accept the terms to place your order.
                      </p>
                    ) : null}
                  </div>

                  {failure ? (
                    <p role="alert" className="mt-6 border border-error/40 p-4 text-sm text-error">
                      {failure}
                    </p>
                  ) : null}

                  <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => goTo(2)} className="label flex items-center gap-2 text-muted hover:text-fg">
                      <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
                      Back
                    </button>
                    <Button size="lg" variant="accent" onClick={place} loading={placing} className="sm:min-w-[18rem]">
                      Place order · {formatPrice(summary.total)}
                    </Button>
                  </div>
                </div>
              ) : null}
            </m.section>
          </AnimatePresence>
        </div>
      </div>

      <aside className="lg:col-span-5">
        <div className="border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:transition-[top] lg:duration-500">
          <div className="flex items-baseline justify-between">
            <h2 className="title">Your order</h2>
            <Link href="/cart" className="label link-undraw text-muted">
              Edit bag
            </Link>
          </div>
          <div className="mt-6 border-b border-line pb-6">
            <SummaryItems rows={summary.purchasable} />
          </div>
          <SummaryLines
            className="mt-6"
            subtotal={summary.subtotal}
            protect={summary.protect}
            shipping={summary.shipping}
            gst={summary.gst}
            total={summary.total}
            shippingLabel={delivery === "express" ? "Priority authentication" : "Insured delivery"}
          />
          <div className="mt-8 border-t border-line pt-6">
            <TrustNotes />
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepTitle({ id, index, title }: { id: string; index: number; title: string }) {
  return (
    <div>
      <p className="mono text-muted">Step {index} of 4</p>
      <h2 id={id} className="display-sm mt-3">
        {title}
      </h2>
    </div>
  );
}

function StepNav({ onBack, onNext, next }: { onBack: () => void; onNext: () => void; next: string }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <button type="button" onClick={onBack} className="label flex items-center gap-2 text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        Back
      </button>
      <Button onClick={onNext} icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
        {next}
      </Button>
    </div>
  );
}

function ReviewRow({
  label,
  children,
  onEdit,
  editLabel = "Change",
}: {
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 py-5 text-sm sm:grid-cols-[9rem_1fr_auto] sm:gap-6">
      <p className="label text-muted">{label}</p>
      <div className="text-fg/90">{children}</div>
      {onEdit ? (
        <button type="button" onClick={onEdit} className={cn("label flex items-center gap-1.5 self-start text-muted hover:text-fg")}>
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
          {editLabel}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
