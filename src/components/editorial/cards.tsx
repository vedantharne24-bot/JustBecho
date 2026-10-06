import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Edit } from "@/lib/data/edits";
import type { Article } from "@/lib/data/journal";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function EditCard({ edit, count, className, sizes = "(min-width: 1024px) 25vw, 80vw" }: { edit: Edit; count: number; className?: string; sizes?: string }) {
  return (
    <Link href={`/edits/${edit.slug}`} className={cn("group theme-dark relative block overflow-hidden", className)} data-cursor="Explore">
      <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: edit.tint }}>
        <Image
          src={edit.hero.src}
          alt={edit.hero.alt}
          fill
          sizes={sizes}
          className="object-cover opacity-80 transition-[transform,opacity] duration-[1400ms] ease-out group-hover:scale-105 group-hover:opacity-95"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${edit.tint} 8%, transparent 65%)` }} />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="mono text-ivory/70">{edit.kicker}</p>
          <p className="font-display mt-2 text-[2.1rem] leading-[0.95] text-ivory">
            {edit.title} <em>{edit.titleItalic}</em>
          </p>
          <p className="mono mt-4 flex items-center justify-between text-ivory/60">
            {count} pieces
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.25} />
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, large = false, className }: { article: Article; large?: boolean; className?: string }) {
  return (
    <Link href={`/journal/${article.slug}`} className={cn("group block", className)}>
      <div className={cn("relative overflow-hidden bg-media", large ? "aspect-[4/3] lg:aspect-[16/11]" : "aspect-[4/3]")}>
        <Image
          src={article.hero.src}
          alt={article.hero.alt}
          fill
          sizes={large ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <p className="mono mt-5 flex items-center gap-3 text-muted">
        <span className="text-fg">{article.category}</span>
        <span aria-hidden className="h-px w-5 bg-line-strong" />
        {article.readTime} min read
      </p>
      <h3 className={cn("font-display mt-3 leading-[1.02] tracking-tight", large ? "text-4xl sm:text-5xl" : "text-[1.75rem]")}>
        <span className="link-draw">
          {article.title} {article.titleItalic ? <em>{article.titleItalic}</em> : null}
        </span>
      </h3>
      <p className={cn("mt-3 text-muted", large ? "lede max-w-xl" : "text-sm")}>{article.dek}</p>
      <p className="mt-4 text-xs text-subtle">
        {article.author} · {formatDate(article.date)}
      </p>
    </Link>
  );
}
