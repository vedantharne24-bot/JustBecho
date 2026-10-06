import Image from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs, Eyebrow } from "@/components/ui/misc";
import type { ProductImage } from "@/lib/types";

/** Editorial header shared by Explore, departments, categories and brands. */
export function CollectionHeader({
  crumbs,
  eyebrow,
  title,
  description,
  count,
  image,
  aside,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  count?: number;
  image?: ProductImage;
  aside?: ReactNode;
}) {
  return (
    <header className="container-x pb-10 pt-8 sm:pb-14 sm:pt-12">
      <Breadcrumbs items={crumbs} />
      <div className={image ? "mt-10 grid gap-10 lg:grid-cols-12 lg:items-end" : "mt-10"}>
        <div className={image ? "lg:col-span-7" : ""}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="display-lg mt-5" data-reveal>
            {title}
          </h1>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {description ? (
              <p className="lede max-w-xl text-muted" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
                {description}
              </p>
            ) : null}
            {count != null && !image ? <p className="mono shrink-0 text-muted">{count} pieces live</p> : null}
          </div>
          {aside}
        </div>
        {image ? (
          <div className="lg:col-span-5">
            <div data-reveal="mask" className="relative aspect-[16/10] overflow-hidden bg-media lg:aspect-[4/3]">
              <Image src={image.src} alt={image.alt} fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="reveal-media object-cover" />
            </div>
            {count != null ? <p className="mono mt-3 text-right text-muted">{count} pieces live</p> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
