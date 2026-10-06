import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { Accordion } from "@/components/ui/accordion";
import { Breadcrumbs, Eyebrow } from "@/components/ui/misc";
import { ContactForm } from "@/components/help/contact-form";
import { CONDITIONS } from "@/lib/conditions";
import { formatPrice } from "@/lib/format";
import { PROTECT_FEE, PROTECT_INCLUDED_ABOVE } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Orders, authentication, shipping, returns and selling on JustBecho.",
};

const SECTIONS = [
  { id: "orders", label: "Orders & delivery" },
  { id: "condition", label: "Condition guide" },
  { id: "shipping", label: "Shipping & returns" },
  { id: "terms", label: "Terms" },
  { id: "privacy", label: "Privacy" },
  { id: "contact", label: "Contact" },
];

export default function HelpPage() {
  return (
    <PageShell>
      <div className="container-x pb-28 pt-8 sm:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Help" }]} />
        <Eyebrow className="mt-10">Client care</Eyebrow>
        <h1 className="display-lg mt-5" data-reveal>
          How can we <em>help?</em>
        </h1>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12">
          <nav aria-label="Help topics" className="lg:col-span-3">
            <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:mx-0 lg:flex-col lg:gap-0 lg:border-t lg:border-line lg:px-0">
              {SECTIONS.map((s) => (
                <li key={s.id} className="shrink-0 lg:border-b lg:border-line">
                  <a href={`#${s.id}`} className="block rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-fg lg:rounded-none lg:border-0 lg:px-0 lg:py-3.5">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-24 lg:col-span-8 lg:col-start-5">
            <section id="orders" aria-labelledby="orders-title" className="scroll-mt-32">
              <h2 id="orders-title" className="display-sm mb-8">
                Orders & delivery
              </h2>
              <Accordion
                single
                items={[
                  { id: "track", title: "How do I track my order?", content: "Every order has a live timeline in Your account → Orders, from seller confirmation through authentication to delivery. We also message you on WhatsApp at each checkpoint." },
                  { id: "long", title: "How long does delivery take?", content: "Usually 5–7 working days including authentication. Priority authentication brings this to 3–4 days." },
                  { id: "cancel", title: "Can I cancel an order?", content: "Yes, free of charge until the seller dispatches to the Becho Hub. After that, contact client care." },
                  { id: "emi", title: "Do you offer EMI?", content: "No-cost EMI over 3, 6 or 9 months is available on eligible credit cards for orders above ₹10,000." },
                ]}
              />
            </section>

            <section id="condition" aria-labelledby="condition-title" className="scroll-mt-32">
              <h2 id="condition-title" className="display-sm mb-3">
                Condition guide
              </h2>
              <p className="mb-8 max-w-xl text-sm text-muted">
                Sellers grade their pieces; our specialists verify the grade at the hub. If it doesn’t match, you decide whether to proceed.
              </p>
              <dl className="border-t border-line">
                {CONDITIONS.map((c) => (
                  <div key={c.value} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[12rem_1fr]">
                    <dt className="flex items-center gap-3">
                      <span className="flex gap-0.5" aria-hidden>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span key={i} className={i < c.grade ? "h-2.5 w-1 bg-fg" : "h-2.5 w-1 bg-line-strong"} />
                        ))}
                      </span>
                      <span className="text-sm">{c.label}</span>
                    </dt>
                    <dd className="text-sm text-muted">{c.description}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="shipping" aria-labelledby="shipping-title" className="scroll-mt-32">
              <h2 id="shipping-title" className="display-sm mb-8">
                Shipping & returns
              </h2>
              <div className="grid grid-cols-1 gap-8 text-sm leading-relaxed text-muted sm:grid-cols-2">
                <p>
                  <span className="mb-2 block text-fg">Insured, complimentary delivery</span>
                  Every order ships fully insured in tamper-evident packaging. Delivery requires an OTP sent to your phone.
                </p>
                <p>
                  <span className="mb-2 block text-fg">Becho Protect</span>
                  {formatPrice(PROTECT_FEE)} per piece, complimentary from {formatPrice(PROTECT_INCLUDED_ABOVE)}. Covers hand authentication, a numbered seal and a money-back guarantee.
                </p>
                <p>
                  <span className="mb-2 block text-fg">Not as described?</span>
                  Report it within 48 hours of delivery. We collect it free of charge and refund you in full once it’s back at the hub.
                </p>
                <p>
                  <span className="mb-2 block text-fg">Change of mind</span>
                  As pieces are one of a kind and authenticated for you, change-of-mind returns aren’t accepted. You can relist it with us in two minutes.
                </p>
              </div>
            </section>

            <section id="terms" aria-labelledby="terms-title" className="scroll-mt-32">
              <h2 id="terms-title" className="display-sm mb-6">
                Terms
              </h2>
              <div className="flex max-w-2xl flex-col gap-4 text-sm leading-relaxed text-muted">
                <p>
                  JustBecho is a managed marketplace: sellers list pieces they own, buyers pay JustBecho, and pieces with Becho Protect pass through our hub before delivery. Sellers are paid after delivery, net of commission.
                </p>
                <p>
                  Sellers declare that every piece is authentic and owned by them. Counterfeit listings are removed and reported, and the seller’s account is closed.
                </p>
              </div>
            </section>

            <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-32">
              <h2 id="privacy-title" className="display-sm mb-6">
                Privacy
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted">
                We collect only what we need to deliver and authenticate your orders. Card and bank details are handled by our PCI-DSS certified payments partner and never stored by JustBecho. You can download your data at any time from Settings.
              </p>
            </section>

            <section id="contact" aria-labelledby="contact-title" className="scroll-mt-32">
              <h2 id="contact-title" className="display-sm mb-3">
                Contact client care
              </h2>
              <p className="mb-10 text-sm text-muted">Monday to Saturday, 10 am – 8 pm IST. We reply within two working hours.</p>
              <ContactForm />
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
