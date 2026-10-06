"use client";

import { useId, useMemo, useState } from "react";
import { m } from "motion/react";
import { TrendingUp } from "lucide-react";
import type { MarketPoint } from "@/lib/market";
import { formatPrice, formatPriceCompact } from "@/lib/format";
import { ease } from "@/lib/motion";

/**
 * Indicative 24-month market value for investment pieces, with the boutique
 * price as a dashed reference. One series, one axis, hover/keyboard readout.
 */
export function MarketValue({ points, retail, name }: { points: MarketPoint[]; retail: number; name: string }) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 260;
  const P = { t: 20, r: 12, b: 30, l: 12 };
  const values = points.map((p) => p.value);
  // Zero baseline: the shaded area encodes value, so it must start at nothing
  const lo = 0;
  const hi = Math.max(retail, ...values) * 1.06;
  const x = (i: number) => P.l + (i / (points.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);

  const line = useMemo(
    () =>
      points.reduce((d, p, i) => {
        if (i === 0) return `M ${x(0)} ${y(p.value)}`;
        const cx = (x(i - 1) + x(i)) / 2;
        return `${d} C ${cx} ${y(points[i - 1].value)}, ${cx} ${y(p.value)}, ${x(i)} ${y(p.value)}`;
      }, ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, lo, hi],
  );
  const area = `${line} L ${x(points.length - 1)} ${H - P.b} L ${x(0)} ${H - P.b} Z`;
  const activeIndex = hover ?? points.length - 1;
  const active = points[activeIndex];
  const yearAgo = points[Math.max(0, points.length - 13)].value;
  const change = ((points[points.length - 1].value - yearAgo) / yearAgo) * 100;
  const multiple = points[points.length - 1].value / retail;

  return (
    <section aria-labelledby={`mv-${id}`} className="border-t border-line">
      <div className="container-x grid grid-cols-1 gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="mono text-muted">Market value · 24 months</p>
          <h2 id={`mv-${id}`} className="display-sm mt-4">
            A piece that <em>holds its value.</em>
          </h2>
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6">
            <div>
              <dt className="mono text-muted">12-month change</dt>
              <dd className="price mt-2 flex items-center gap-2 text-3xl">
                <TrendingUp className="h-5 w-5 text-success" strokeWidth={1.5} aria-hidden />
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="mono text-muted">Against retail</dt>
              <dd className="price mt-2 text-3xl">{multiple.toFixed(2)}×</dd>
            </div>
          </dl>
          <p className="mt-8 max-w-xs text-xs leading-relaxed text-subtle">
            Indicative trend for this reference, from comparable completed sales. Past prices don’t guarantee future value.
          </p>
        </div>

        <figure className="lg:col-span-8">
          <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
            <span>
              <span className="mono text-muted">{active.label}</span>
              <span className="price ml-3 text-2xl">{formatPrice(active.value)}</span>
            </span>
            <span className="flex items-center gap-5 text-xs text-muted">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-5 bg-fg" aria-hidden /> {name}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 border-t border-dashed border-muted" aria-hidden /> Retail
              </span>
            </span>
          </figcaption>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label={`Market value of ${name} over 24 months, now ${formatPrice(points[points.length - 1].value)} against a retail price of ${formatPrice(retail)}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? points.length - 1) - 1));
              if (e.key === "ArrowRight") setHover((h) => Math.min(points.length - 1, (h ?? points.length - 1) + 1));
            }}
            onBlur={() => setHover(null)}
            onPointerLeave={() => setHover(null)}
            onPointerMove={(e) => {
              const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const px = ((e.clientX - r.left) / r.width) * W;
              setHover(Math.max(0, Math.min(points.length - 1, Math.round(((px - P.l) / (W - P.l - P.r)) * (points.length - 1)))));
            }}
          >
            <defs>
              <linearGradient id={`mvf-${id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--fg)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} stroke="var(--line-strong)" />
            <line x1={P.l} x2={W - P.r} y1={y(retail)} y2={y(retail)} stroke="var(--muted)" strokeDasharray="4 5" />
            <text x={W - P.r} y={y(retail) - 8} textAnchor="end" className="fill-[var(--muted)] font-mono text-[10px] uppercase">
              Retail {formatPriceCompact(retail)}
            </text>
            <m.path d={area} fill={`url(#mvf-${id})`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.6 }} />
            <m.path
              d={line}
              fill="none"
              stroke="var(--fg)"
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: ease.out }}
            />
            <line x1={x(activeIndex)} x2={x(activeIndex)} y1={P.t} y2={H - P.b} stroke="var(--line-strong)" />
            <circle cx={x(activeIndex)} cy={y(active.value)} r={5} fill="var(--bg)" stroke="var(--accent)" strokeWidth={2} />
            {points.map((p, i) =>
              i % 6 === 0 || i === points.length - 1 ? (
                <text key={p.label} x={x(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} className="fill-[var(--subtle)] font-mono text-[10px] uppercase">
                  {p.label}
                </text>
              ) : null,
            )}
          </svg>
          <table className="sr-only">
            <caption>Indicative market value by month</caption>
            <tbody>
              {points.map((p) => (
                <tr key={p.label}>
                  <th scope="row">{p.label}</th>
                  <td>{formatPrice(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </div>
    </section>
  );
}
