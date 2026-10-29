import type { ReactNode } from "react";

export const TREND_CARD = "rounded-card bg-card p-card shadow-card";
export const PLOT_HEIGHT = 200;
export const BUBBLE_SPACE = 56;
const SKELETON_HEIGHTS = ["h-[56%]", "h-[62%]", "h-[52%]", "h-[64%]", "h-[59%]", "h-[66%]"];

export function TrendsHeading({ control }: { control: ReactNode }): ReactNode {
  return (
    <div className="grid gap-4 md:flex md:items-start md:justify-between">
      <div>
        <h2 id="trends-heading" tabIndex={-1} className="text-h2 font-bold">
          Monthly trends
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Select a month to see its total</p>
      </div>
      {control}
    </div>
  );
}

export function TrendBars(): ReactNode {
  return (
    <div aria-hidden className="mt-6 flex h-64 items-end justify-around gap-2 md:ml-14">
      {SKELETON_HEIGHTS.map((height) => (
        <span key={height} className={`w-5.5 animate-pulse rounded-pill bg-skeleton md:w-6.5 ${height}`} />
      ))}
    </div>
  );
}

export function TrendSkeleton(): ReactNode {
  return (
    <section aria-labelledby="trends-heading" aria-busy="true" className={TREND_CARD}>
      <TrendsHeading
        control={<span aria-hidden className="h-12 w-32 animate-pulse rounded-12 bg-skeleton lg:h-10" />}
      />
      <TrendBars />
      <div aria-hidden className="mt-5 h-12 animate-pulse rounded-icon-button bg-skeleton" />
    </section>
  );
}
