export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="container-x pb-24 pt-[calc(var(--header-h)+2rem)]" aria-busy aria-label="Loading">
      <div className="skeleton h-3 w-40" />
      <div className="skeleton mt-10 h-16 w-2/3 max-w-2xl" />
      <div className="skeleton mt-6 h-4 w-1/2 max-w-md" />
      <div className="skeleton mt-14 h-14 w-full" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-3 w-1/3" />
            <div className="skeleton mt-2 h-3 w-2/3" />
            <div className="skeleton mt-3 h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="container-x pb-24 pt-[calc(var(--header-h)+1.5rem)]" aria-busy aria-label="Loading">
      <div className="skeleton h-3 w-64" />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="skeleton aspect-[4/5] lg:col-span-7" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-12 w-3/4" />
          <div className="skeleton mt-6 h-10 w-1/3" />
          <div className="skeleton mt-6 h-2 w-full" />
          <div className="skeleton mt-6 h-24 w-full" />
          <div className="skeleton mt-4 h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
