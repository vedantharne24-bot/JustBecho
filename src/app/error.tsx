"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Report to monitoring (Sentry, Datadog…) here
    console.error(error);
  }, [error]);

  return (
    <section className="container-x flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="mono text-muted">Something went wrong{error.digest ? ` · ${error.digest}` : ""}</p>
      <h1 className="display-lg mt-6">
        A small <em>hitch.</em>
      </h1>
      <p className="lede mt-6 max-w-md text-muted">
        We couldn’t load this page. Your bag and wishlist are safe — try again, or head back to the edit.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </section>
  );
}
