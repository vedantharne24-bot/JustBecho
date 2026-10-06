import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="theme-dark grain relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="container-x pt-[var(--header-h)]">
        <p className="mono text-muted">Error 404 · Not authenticated</p>
        <h1 className="display-xl mt-8">
          Lost, <em>not found.</em>
        </h1>
        <p className="lede mt-8 max-w-md text-muted">
          This page may have sold, moved, or never existed. Everything we can vouch for is a click away.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <ButtonLink href="/explore" variant="light" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.25} />}>
            Explore the edit
          </ButtonLink>
          <Link href="/" className="label link-undraw">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
