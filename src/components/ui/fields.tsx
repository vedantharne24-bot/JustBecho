"use client";

import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
   Form primitives — underline inputs with floating-free, always-visible
   labels (clearer than placeholders), inline errors and hints.
   ────────────────────────────────────────────────────────────────────────── */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="label flex items-center justify-between text-muted">
        <span>{label}</span>
        {optional ? <span className="normal-case tracking-normal text-subtle">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  "h-12 w-full border-0 border-b border-line-strong bg-transparent px-0 text-[0.9375rem] text-fg placeholder:text-subtle transition-colors duration-200 focus:border-fg focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-error disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
        {...props}
        className={cn(inputBase, className)}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea"> & { invalid?: boolean }>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        {...props}
        className={cn(inputBase, "h-auto min-h-28 resize-y py-3 leading-relaxed", className)}
      />
    );
  },
);

export function NativeSelect({
  className,
  invalid,
  children,
  ...props
}: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        {...props}
        className={cn(inputBase, "appearance-none pr-8", className)}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={1.25}
        className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  className,
  disabled,
  count,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  disabled?: boolean;
  count?: number;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex cursor-pointer items-start gap-3 py-1.5 text-sm",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <span className="relative mt-[3px] grid h-4 w-4 shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer appearance-none border border-line-strong transition-colors checked:border-fg checked:bg-fg focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover:border-fg"
        />
        <Check
          aria-hidden
          strokeWidth={2.25}
          className="pointer-events-none relative h-3 w-3 scale-50 text-bg opacity-0 transition-[opacity,scale] duration-200 peer-checked:scale-100 peer-checked:opacity-100"
        />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-3 text-fg">
          {label}
          {count != null ? <span className="tabular text-xs text-subtle">{count}</span> : null}
        </span>
        {description ? <span className="mt-0.5 text-xs text-muted">{description}</span> : null}
      </span>
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <label htmlFor={id} className="text-sm text-fg">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-fg bg-fg" : "border-line-strong bg-transparent",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-[left,background-color] duration-300 ease-out",
            checked ? "left-[calc(100%-1.15rem)] bg-bg" : "left-[0.15rem] bg-fg",
          )}
        />
      </button>
    </div>
  );
}

/** Large selectable card used for radio choices (delivery, payment, condition) */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  aside,
  disabled,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "group relative flex cursor-pointer gap-4 border p-4 transition-[border-color,background-color] duration-300 sm:p-5",
        checked ? "border-fg bg-surface" : "border-line hover:border-line-strong",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          checked ? "border-fg" : "border-line-strong",
        )}
      >
        <span className={cn("h-2 w-2 rounded-full bg-fg transition-transform duration-300", checked ? "scale-100" : "scale-0")} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm text-fg">{title}</span>
        {description ? <span className="text-xs leading-relaxed text-muted">{description}</span> : null}
      </span>
      {aside ? <span className="shrink-0 text-sm text-fg">{aside}</span> : null}
    </label>
  );
}
