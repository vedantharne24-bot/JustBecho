import type { Edit } from "@/lib/data/edits";
import type { Article } from "@/lib/data/journal";
import { ArticleCard, EditCard } from "@/components/editorial/cards";
import { SectionHeader } from "@/components/ui/misc";

export function HomeEdits({ edits }: { edits: (Edit & { count: number })[] }) {
  return (
    <section aria-labelledby="edits-title" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader
          eyebrow="Curated edits"
          index="05"
          title={
            <span id="edits-title">
              Chosen for the <em>moment.</em>
            </span>
          }
          description="Small selections from our specialists — for weddings, for gifting, for a first watch, for the drop you missed."
          href="/edits"
          linkLabel="All edits"
        />
      </div>
      <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] sm:gap-5 lg:container-x lg:grid lg:grid-cols-4 lg:overflow-visible">
        {edits.map((edit, i) => (
          <li key={edit.slug} className="w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto" data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
            <EditCard edit={edit} count={edit.count} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeJournal({ articles }: { articles: Article[] }) {
  const [first, ...rest] = articles;
  return (
    <section aria-labelledby="journal-title" className="container-x border-t border-line py-24 sm:py-32">
      <SectionHeader
        eyebrow="The Journal"
        index="09"
        title={
          <span id="journal-title">
            Notes from <em>the bench.</em>
          </span>
        }
        href="/journal"
        linkLabel="Read the Journal"
      />
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-7" data-reveal>
          <ArticleCard article={first} large />
        </div>
        <div className="flex flex-col gap-14 lg:col-span-4 lg:col-start-9">
          {rest.slice(0, 2).map((a, i) => (
            <div key={a.slug} data-reveal style={{ ["--reveal-delay" as string]: `${(i + 1) * 90}ms` }}>
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
