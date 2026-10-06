import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs, Eyebrow } from "@/components/ui/misc";
import { ArticleCard } from "@/components/editorial/cards";
import { getArticles } from "@/lib/api/editorial";

export const metadata: Metadata = {
  title: "Journal",
  description: "Authentication guides, collecting advice and care notes from the specialists at the Becho Hub.",
};

export default async function JournalPage() {
  const [featured, ...rest] = await getArticles();
  return (
    <PageShell>
      <header className="container-x pb-14 pt-8 sm:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal" }]} />
        <Eyebrow className="mt-10">From the Becho Hub</Eyebrow>
        <h1 className="display-lg mt-5" data-reveal>
          The <em>Journal.</em>
        </h1>
        <p className="lede mt-6 max-w-xl text-muted" data-reveal>
          Notes from our specialists on what makes a piece genuine, what makes it valuable, and how to keep it that way.
        </p>
      </header>
      <div className="container-x pb-28">
        <div data-reveal>
          <ArticleCard article={featured} large />
        </div>
        <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 border-t border-line pt-16 md:grid-cols-3">
          {rest.map((a, i) => (
            <div key={a.slug} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
