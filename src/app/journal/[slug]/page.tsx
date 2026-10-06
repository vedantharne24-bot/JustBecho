import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ui/misc";
import { ProductCard } from "@/components/product/product-card";
import { ArticleCard } from "@/components/editorial/cards";
import { ReadingProgress } from "@/components/editorial/reading-progress";
import { Parallax } from "@/components/motion/parallax";
import { SplitReveal } from "@/components/motion/split-reveal";
import { getArticle } from "@/lib/api/editorial";
import { ARTICLES } from "@/lib/data/journal";
import { formatDate } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const data = await getArticle((await params).slug);
  if (!data) return { title: "Story not found" };
  const { article } = data;
  return { title: `${article.title} ${article.titleItalic ?? ""}`.trim(), description: article.dek };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const data = await getArticle((await params).slug);
  if (!data) notFound();
  const { article, related, products } = data;
  const firstParagraph = article.body.findIndex((b) => b.type === "p");

  return (
    <PageShell>
      <ReadingProgress targetId="article-body" />
      <article>
        <header className="container-x pb-12 pt-8 sm:pt-12">
          <Breadcrumbs items={[{ label: "Journal", href: "/journal" }, { label: article.category }]} />
          <div className="mx-auto mt-14 max-w-4xl text-center">
            <p className="mono text-muted">
              {article.category} · {article.readTime} min read
            </p>
            <SplitReveal as="h1" className="display-lg mt-6">
              {article.title} {article.titleItalic ? <em>{article.titleItalic}</em> : null}
            </SplitReveal>
            <p className="lede mx-auto mt-8 max-w-2xl text-muted" data-reveal>
              {article.dek}
            </p>
            <p className="mt-8 text-sm" data-reveal>
              {article.author} <span className="text-muted">· {article.role} · {formatDate(article.date)}</span>
            </p>
          </div>
        </header>

        <div className="container-x" data-reveal="mask">
          <Parallax className="aspect-[16/10] bg-media sm:aspect-[21/9]" amount={14}>
            <Image src={article.hero.src} alt={article.hero.alt} fill preload sizes="100vw" className="object-cover" />
          </Parallax>
        </div>

        <div id="article-body" className="container-x py-20 sm:py-28">
          <div className="mx-auto max-w-[44rem]">
            {article.body.map((block, i) => {
              switch (block.type) {
                case "p": {
                  const drop = i === firstParagraph;
                  return (
                    <p
                      key={i}
                      className={
                        drop
                          ? "mt-0 text-lg leading-[1.75] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.8rem] first-letter:leading-[0.78]"
                          : "mt-6 text-[1.0625rem] leading-[1.75] text-fg/85"
                      }
                    >
                      {block.text}
                    </p>
                  );
                }
                case "h2":
                  return (
                    <h2 key={i} className="font-display mt-14 text-3xl">
                      {block.text}
                    </h2>
                  );
                case "quote":
                  return (
                    <figure key={i} className="my-14 border-y border-line py-10 text-center" data-reveal>
                      <blockquote className="display-sm italic leading-[1.2]">“{block.text}”</blockquote>
                      {block.by ? <figcaption className="mono mt-6 text-muted">{block.by}</figcaption> : null}
                    </figure>
                  );
                case "list":
                  return (
                    <ul key={i} className="mt-6 flex flex-col gap-3">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-4 text-[1.0625rem] leading-[1.7] text-fg/85">
                          <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                case "image":
                  return (
                    <figure key={i} className="my-14 sm:-mx-16" data-reveal>
                      <div className="relative aspect-[4/3] overflow-hidden bg-media">
                        <Image src={block.image.src} alt={block.image.alt} fill sizes="(min-width: 768px) 52rem, 100vw" className="object-cover" />
                      </div>
                      <figcaption className="mono mt-3 text-muted">{block.caption}</figcaption>
                    </figure>
                  );
                case "products": {
                  const items = block.slugs.map((s) => products[s]).filter(Boolean);
                  return (
                    <aside key={i} className="my-16 border-t border-line pt-8 sm:-mx-24 lg:-mx-40" aria-label={block.title}>
                      <p className="mono mb-6 text-muted">{block.title}</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4">
                        {items.map((p) => (
                          <ProductCard key={p.id} product={p} sizes="(min-width: 768px) 20vw, 46vw" />
                        ))}
                      </div>
                    </aside>
                  );
                }
              }
            })}
          </div>
        </div>
      </article>

      <section aria-label="More stories" className="container-x border-t border-line py-20 sm:py-24">
        <p className="mono mb-10 text-muted">More from the Journal</p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3">
          {related.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
