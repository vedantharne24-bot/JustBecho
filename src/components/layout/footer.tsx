import Link from "next/link";
import { FOOTER_NAV } from "@/lib/nav";
import { Seal } from "@/components/ui/seal";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="theme-dark relative overflow-hidden">
      <div className="container-x pt-20 sm:pt-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mono text-muted">The Becho Letter</p>
            <h2 className="display-sm mt-5 max-w-md">
              First access to the Vault, <em>every Friday.</em>
            </h2>
            <div className="mt-8 max-w-md">
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:col-span-7 lg:pl-8">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <p className="mono mb-5 text-muted">{group.title}</p>
                <ul className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="link-draw text-sm text-fg/85 transition-colors hover:text-fg">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-8 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Seal className="w-16 text-champagne" />
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              Authenticated in Mumbai. Delivered insured across India.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
            <li>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="link-draw hover:text-fg">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" className="link-draw hover:text-fg">
                YouTube
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="link-draw hover:text-fg">
                LinkedIn
              </a>
            </li>
            <li>
              <Link href="/help#contact" className="link-draw hover:text-fg">
                WhatsApp concierge
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none mt-12 select-none overflow-hidden">
        <div className="container-x text-fg/[0.08]" data-reveal>
          <Logo variant="display" title="" className="h-auto w-full [&_rect]:fill-current" />
        </div>
      </div>

      <div className="container-x flex flex-col gap-3 border-t border-line py-6 text-[11px] text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} JustBecho. Authenticated pre-owned luxury.</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          <li>
            <Link href="/help#terms" className="hover:text-fg">
              Terms
            </Link>
          </li>
          <li>
            <Link href="/help#privacy" className="hover:text-fg">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/help#shipping" className="hover:text-fg">
              Shipping & returns
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
