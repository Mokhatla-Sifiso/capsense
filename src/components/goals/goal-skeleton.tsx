import type { ReactNode } from "react";

export const GOAL_CARD = "rounded-card bg-card p-card shadow-card";
export const GOAL_LIST =
  "mt-card-gap grid divide-y divide-border md:grid-cols-2 md:gap-x-6 md:gap-y-6 md:divide-y-0 lg:grid-cols-1 lg:gap-0 lg:divide-y";
export const GOAL_ITEM = "py-4.5 first:pt-0 last:pb-0 md:py-0 lg:py-4.5 lg:first:pt-0 lg:last:pb-0";
export const GOAL_RING = "size-19 shrink-0 md:size-21";

export function GoalsHeading(): ReactNode {
  return (
    <h2 id="goals-heading" tabIndex={-1} className="text-h2 font-bold">
      Spending goals
    </h2>
  );
}

export function GoalBars(): ReactNode {
  return (
    <ul aria-hidden className={GOAL_LIST}>
      {[0, 1].map((goal) => (
        <li key={goal} className={`flex animate-pulse items-center gap-4 ${GOAL_ITEM}`}>
          <span className={`${GOAL_RING} rounded-circle border-12 border-skeleton`} />
          <span className="grid flex-1 gap-2.5">
            <span className="h-4 w-3/5 rounded-6 bg-skeleton" />
            <span className="h-4 w-4/5 rounded-6 bg-skeleton" />
            <span className="h-3.5 w-full rounded-6 bg-skeleton" />
            <span className="h-3.5 w-1/2 rounded-6 bg-skeleton" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function GoalSkeleton(): ReactNode {
  return (
    <section aria-labelledby="goals-heading" aria-busy="true" className={GOAL_CARD}>
      <GoalsHeading />
      <span aria-hidden className="mt-2 block h-4 w-40 animate-pulse rounded-6 bg-skeleton" />
      <GoalBars />
    </section>
  );
}
