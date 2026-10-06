"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { wait } from "@/lib/utils";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setState("loading");
    // Integration point: POST to the ESP (Klaviyo, Brevo…) via a route handler.
    await wait(700);
    setState("done");
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-3 border-b border-line-strong pb-4 text-sm" role="status">
        <Check className="h-4 w-4 text-accent" strokeWidth={1.5} />
        You’re on the list. The next letter arrives Friday.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center border-b transition-colors duration-300 focus-within:border-fg",
          error ? "border-error" : "border-line-strong",
        )}
      >
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          placeholder="Your email address"
          className="h-14 min-w-0 flex-1 bg-transparent text-[0.9375rem] placeholder:text-subtle focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          aria-label="Subscribe"
          className="group grid h-12 w-12 place-items-center"
        >
          {state === "loading" ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent" />
          ) : (
            <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
          )}
        </button>
      </div>
      {error ? (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-xs text-subtle">New arrivals from the Vault, a week before everyone else. No noise.</p>
      )}
    </form>
  );
}
