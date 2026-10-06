"use client";

import { useId, useMemo, useState } from "react";
import { m } from "motion/react";
import { formatPriceCompact } from "@/lib/format";
import { ease } from "@/lib/motion";

/**
 * Weekly sales as a single-series area chart. One quiet line, a hairline
 * baseline, and a crosshair readout on hover/focus — no chart library.
 */
export function SalesChart({ data }: { data: { label: string; value: number }[] }) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const P = { t: 16, r: 8, b: 28, l: 8 };
  const max = Math.max(...data.map((d) => d.value), 1);

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        x: P.l + (i / Math.max(1, data.length - 1)) * (W - P.l - P.r),
        y: P.t + (1 - d.value / (max * 1.1)) * (H - P.t - P.b),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, max],
  );

  // Monotone-ish smoothing with cubic segments
  const line = points.reduce((path, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${path} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");
  const area = `${line} L ${points[points.length - 1].x} ${H - P.b} L ${points[0].x} ${H - P.b} Z`;
  const active = hover ?? data.length - 1;
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <figure>
      <figcaption className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <span>
          <span className="label text-muted">{data[active].label}</span>
          <span className="price ml-3 text-3xl">{formatPriceCompact(data[active].value)}</span>
        </span>
        <span className="mono text-muted">12 weeks · {formatPriceCompact(total)}</span>
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Weekly sales over 12 weeks, totalling ${formatPriceCompact(total)}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? data.length - 1) - 1));
            if (e.key === "ArrowRight") setHover((h) => Math.min(data.length - 1, (h ?? data.length - 1) + 1));
          }}
          onBlur={() => setHover(null)}
          onPointerLeave={() => setHover(null)}
          onPointerMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W;
            let nearest = 0;
            points.forEach((p, i) => {
              if (Math.abs(p.x - x) < Math.abs(points[nearest].x - x)) nearest = i;
            });
            setHover(nearest);
          }}
        >
          <defs>
            <linearGradient id={`fill-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={P.l} x2={W - P.r} y1={P.t + f * (H - P.t - P.b)} y2={P.t + f * (H - P.t - P.b)} stroke="var(--line)" strokeDasharray="2 4" />
          ))}
          <line x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} stroke="var(--line-strong)" />
          <m.path d={area} fill={`url(#fill-${id})`} className="text-fg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} />
          <m.path
            d={line}
            fill="none"
            stroke="var(--fg)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: ease.out }}
          />
          <line x1={points[active].x} x2={points[active].x} y1={P.t} y2={H - P.b} stroke="var(--line-strong)" />
          <circle cx={points[active].x} cy={points[active].y} r={4.5} fill="var(--bg)" stroke="var(--accent)" strokeWidth={1.5} />
          {data.map((d, i) =>
            i % 2 === 0 || i === data.length - 1 ? (
              <text key={d.label} x={points[i].x} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-[var(--subtle)] font-mono text-[10px] uppercase">
                {d.label}
              </text>
            ) : null,
          )}
        </svg>
        <table className="sr-only">
          <caption>Weekly sales</caption>
          <thead>
            <tr>
              <th scope="col">Week</th>
              <th scope="col">Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{formatPriceCompact(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
