import type { ReactNode } from "react";

export const CATEGORY_HINT = "select one to filter transactions";
export const CATEGORY_CARD = "rounded-card bg-card p-card shadow-card";
export const CATEGORY_HEADER = "flex flex-col items-start gap-3 md:flex-row md:justify-between md:gap-4";
export const CATEGORY_ROWS = "mt-card-gap grid gap-2.5 xl:grid-cols-2";
export const CATEGORY_ROW = "flex min-h-16 overflow-hidden rounded-row md:min-h-17";

export function CategoriesHeading(): ReactNode {
  return (
    <h2 id="categories-heading" tabIndex={-1} className="text-h2 font-bold">
      Spending by category
    </h2>
  );
}

export function CategorySkeleton({ children }: { children?: ReactNode }): ReactNode {
  return (
    <section aria-labelledby="categories-heading" aria-busy="true" className={CATEGORY_CARD}>
      <div className={CATEGORY_HEADER}>
        <div>
          <CategoriesHeading />
          <p aria-hidden className="mt-1 text-sm text-muted-foreground">
            <span className="inline-block w-44 animate-pulse rounded-6 bg-skeleton align-top">{"\u00a0"}</span> ·{" "}
            {CATEGORY_HINT}
          </p>
        </div>
        <p aria-hidden className="w-36 animate-pulse rounded-10 bg-skeleton px-3 py-1.5 text-control">
          {"\u00a0"}
        </p>
      </div>
      <div aria-hidden className={CATEGORY_ROWS}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`${CATEGORY_ROW} animate-pulse bg-skeleton`} />
        ))}
      </div>
      {children}
    </section>
  );
}
