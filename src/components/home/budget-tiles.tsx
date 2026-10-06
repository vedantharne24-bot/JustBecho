import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/misc";

export interface BudgetTile {
  label: string;
  figure: string;
  caption: string;
  href: string;
  count: number;
}

/** Shop by budget — typographic tiles that invert on hover. */
export function BudgetTiles({ tiles }: { tiles: BudgetTile[] }) {
  return (
    <section aria-labelledby="budget-title" className="container-x py-24 sm:py-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow index="06">Shop by budget</Eyebrow>
          <h2 id="budget-title" className="display-md mt-6" data-reveal>
            Start where <em>you are.</em>
          </h2>
        </div>
        <p className="max-w-xs text-sm text-muted" data-reveal>
          The same authentication, the same seal and the same guarantee — at every price.
        </p>
      </div>
      <ul className="mt-12 grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <li key={tile.href} className="border-b border-r border-line" data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
            <Link
              href={tile.href}
              className="group relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden p-6 sm:min-h-[19rem] sm:p-8"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-0 origin-bottom scale-y-0 bg-invert transition-transform duration-700 ease-out group-hover:scale-y-100"
              />
              <span className="relative flex items-start justify-between transition-colors duration-500 group-hover:text-invert-fg">
                <span className="mono">{tile.label}</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1} />
              </span>
              <span className="relative transition-colors duration-500 group-hover:text-invert-fg">
                <span className="font-display block text-[3.25rem] leading-none tracking-tight sm:text-[4rem]">{tile.figure}</span>
                <span className="mt-4 flex items-center justify-between text-sm">
                  <span className="opacity-70">{tile.caption}</span>
                  <span className="mono opacity-70">{tile.count} pieces</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
