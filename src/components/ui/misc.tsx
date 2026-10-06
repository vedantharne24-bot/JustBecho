import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, percentOff } from "@/lib/format";
import { conditionMap } from "@/lib/conditions";
import type { Condition } from "@/lib/types";

export function Eyebrow({ children, className, index }: { children: ReactNode; className?: string; index?: string }) {
  return (
    <p className={cn("mono flex items-center gap-3 text-muted", className)}>
      {index ? <span className="text-fg">{index}</span> : null}
      {index ? <span aria-hidden className="h-px w-8 bg-line-strong" /> : null}
      <span>{children}</span>
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  index,
  title,
  description,
  href,
  linkLabel = "View all",
  className,
}: {
  eyebrow?: string;
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? <Eyebrow index={index}>{eyebrow}</Eyebrow> : null}
        <h2 className="display-md mt-5" data-reveal>
          {title}
        </h2>
        {description ? (
          <p className="lede mt-5 max-w-xl text-muted" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className="label group inline-flex shrink-0 items-center gap-2 self-start md:self-auto">
          <span className="link-draw">{linkLabel}</span>
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.25}
            className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </header>
  );
}

export function Price({
  price,
  retail,
  size = "md",
  className,
  showSaving = false,
}: {
  price: number;
  retail?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSaving?: boolean;
}) {
  const off = percentOff(price, retail);
  return (
    <div className={cn("tabular flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span
        className={cn(
          "text-fg",
          size === "lg" && "price text-3xl sm:text-[2.25rem]",
          size === "md" && "text-[0.9375rem]",
          size === "sm" && "text-sm",
        )}
      >
        {formatPrice(price)}
      </span>
      {retail && retail > price ? (
        <span className={cn("text-subtle line-through decoration-[0.5px]", size === "lg" ? "text-sm" : "text-xs")}>
          {formatPrice(retail)}
        </span>
      ) : null}
      {showSaving && off ? <span className="mono text-accent">{off}% below retail</span> : null}
    </div>
  );
}

export function ConditionTag({ condition, className }: { condition: Condition; className?: string }) {
  return <span className={cn("text-xs text-muted", className)}>{conditionMap[condition].label}</span>;
}

export function AuthMark({ className, label = "Authenticated" }: { className?: string; label?: string }) {
  return (
    <span className={cn("mono inline-flex items-center gap-1.5 text-[10px]", className)}>
      <ShieldCheck aria-hidden className="h-3.5 w-3.5" strokeWidth={1.4} />
      {label}
    </span>
  );
}

export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mono text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {item.label}
              </span>
            )}
            {i < items.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-20 text-center sm:py-28", className)}>
      {icon ? <div className="mb-8 text-muted">{icon}</div> : null}
      <h2 className="display-sm max-w-xl">{title}</h2>
      {description ? <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="mono inline-flex h-5 min-w-5 items-center justify-center rounded-[3px] border border-line px-1 text-[10px] text-muted">
      {children}
    </kbd>
  );
}
