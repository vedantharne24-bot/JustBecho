import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[0.6875rem]",
  md: "h-12 px-7",
  lg: "h-14 px-9",
};

const variants: Record<Variant, { base: string; layer: string }> = {
  primary: {
    base: "bg-invert text-invert-fg",
    layer: "bg-[color-mix(in_oklab,var(--invert)_80%,var(--bg))]",
  },
  accent: {
    base: "bg-accent text-accent-fg",
    layer: "bg-[color-mix(in_oklab,var(--accent)_82%,black)]",
  },
  outline: {
    base: "border border-line-strong text-fg hover:text-invert-fg focus-visible:text-invert-fg",
    layer: "bg-invert",
  },
  light: {
    base: "bg-paper text-ink",
    layer: "bg-bone",
  },
  ghost: {
    base: "text-fg px-0! h-auto! py-1",
    layer: "hidden",
  },
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  loading?: boolean;
  full?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & Omit<ComponentProps<"button">, "children" | "className">;
type LinkProps = CommonProps & Omit<ComponentProps<typeof Link>, "children" | "className">;

function classes({ variant = "primary", size = "md", full, className }: CommonProps) {
  return cn(
    "group/btn relative isolate inline-flex select-none items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-[var(--radius)]",
    "label transition-[color,transform,border-color] duration-300 ease-out active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    sizes[size],
    variants[variant].base,
    full && "w-full",
    className,
  );
}

function Inner({ variant = "primary", icon, iconLeft, loading, children }: CommonProps) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 translate-y-[101%] transition-transform duration-500 ease-out group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0",
          variants[variant].layer,
        )}
      />
      {loading ? (
        <span className="flex items-center gap-2" role="status">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-r-transparent" />
          <span className="sr-only">Working</span>
        </span>
      ) : (
        <>
          {iconLeft ? <span className="-ml-1 flex shrink-0">{iconLeft}</span> : null}
          <span className={cn("roll", variant === "ghost" && "link-draw")}>
            <span>{children}</span>
            {variant !== "ghost" ? <span aria-hidden>{children}</span> : null}
          </span>
          {icon ? (
            <span className="-mr-1 flex shrink-0 transition-transform duration-500 ease-out group-hover/btn:translate-x-1">
              {icon}
            </span>
          ) : null}
        </>
      )}
    </>
  );
}

export function Button({ variant, size, icon, iconLeft, loading, full, className, children, ...rest }: ButtonProps) {
  const common = { variant, size, icon, iconLeft, loading, full, className, children };
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} aria-busy={loading || undefined} className={classes(common)}>
      <Inner {...common} />
    </button>
  );
}

export function ButtonLink({ variant, size, icon, iconLeft, full, className, children, ...rest }: LinkProps) {
  const common = { variant, size, icon, iconLeft, full, className, children };
  return (
    <Link {...rest} className={classes(common)}>
      <Inner {...common} />
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: { label: string } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cn(
        "relative inline-grid h-10 w-10 place-items-center rounded-full text-fg transition-[background-color,transform,opacity] duration-200 hover:bg-hover active:scale-95 disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}
