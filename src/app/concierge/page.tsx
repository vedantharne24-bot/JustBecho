import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, MessageCircle, Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Eyebrow } from "@/components/ui/misc";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { SourcingForm } from "@/components/concierge/sourcing-form";
import { editorial } from "@/lib/images";

export const metadata: Metadata = {
  title: "Concierge",
  description: "Request a specific piece, book a private viewing or speak to a specialist.",
};

const SPECIALISTS = [
  { name: "Meera Iyer", area: "Leather goods · Hermès, Chanel" },
  { name: "Arjun Malhotra", area: "Watches · Rolex, Patek, AP" },
  { name: "Sana Qureshi", area: "Sneakers & streetwear" },
  { name: "Vikram Desai", area: "Fine jewellery & eyewear" },
];

export default function ConciergePage() {
  return (
    <PageShell bleed>
      <section className="theme-dark grain relative isolate overflow-hidden">
        <Parallax className="absolute! inset-0 -z-10" amount={10} scale={1.12}>
          <Image src={editorial.glovedPatek.src} alt={editorial.glovedPatek.alt} fill preload sizes="100vw" className="object-cover opacity-55" />
        </Parallax>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="container-x flex min-h-[88svh] flex-col justify-end pb-16 pt-[calc(var(--header-h)+3rem)] sm:pb-20">
          <Eyebrow>JustBecho Concierge</Eyebrow>
          <SplitReveal as="h1" className="display-xl mt-8 max-w-[12ch]">
            Looking for <em>something?</em>
          </SplitReveal>
          <p className="lede mt-8 max-w-lg text-muted" data-reveal>
            Tell us the piece. Our specialists search private collections and trusted boutiques across India and abroad —
            and nothing reaches you without passing Becho Protect.
          </p>
        </div>
      </section>

      <section className="container-x grid grid-cols-1 gap-14 py-24 sm:py-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow index="01">Request a piece</Eyebrow>
          <h2 className="display-md mt-6">
            The search, <em>handled.</em>
          </h2>
          <ol className="mt-10 flex flex-col gap-6 border-t border-line pt-8">
            {[
              { icon: Search, t: "We search", d: "Private collections, trusted boutiques and auction houses." },
              { icon: MessageCircle, t: "We confirm", d: "Photos, condition and price — before anything moves." },
              { icon: CalendarDays, t: "You decide", d: "View it in person or on a call. No obligation." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.25} />
                <span>
                  <span className="block text-sm">{t}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <SourcingForm />
        </div>
      </section>

      <section className="border-t border-line bg-surface-2">
        <div className="container-x grid grid-cols-1 gap-12 py-24 sm:py-28 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow index="02">Private viewings</Eyebrow>
            <h2 className="display-sm mt-6">
              Mumbai, New Delhi — <em>or on a call.</em>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Every piece in the Vault can be viewed by appointment at our salons, or shown to you live by the specialist who
              authenticated it. Book from any Vault piece’s page.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {SPECIALISTS.map((s) => (
              <li key={s.name} className="flex items-center gap-5 bg-surface-2 p-6">
                <span className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line-strong text-lg">
                  {s.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-sm">{s.name}</span>
                  <span className="mono mt-1 block text-muted">{s.area}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
