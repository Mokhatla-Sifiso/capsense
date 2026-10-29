"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useId } from "react";
import { SectionError } from "@/components/states/section-error";
import { StillLoading } from "@/components/states/still-loading";
import { WarningStrip, refreshProblem } from "@/components/states/warning-strip";
import { formatCurrency } from "@/lib/format";
import {
  type StatusTone,
  daysLeft,
  goalStatus,
  paceLine,
  projection,
  ringCentre,
  ringFill,
  sharedDaysLeft,
  usedValue,
} from "@/lib/goal-cards";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import type { Goal } from "@/schemas/api";
import { GOAL_CARD, GOAL_ITEM, GOAL_LIST, GOAL_RING, GoalBars, GoalsHeading } from "./goal-skeleton";

interface GoalIcons {
  success: ReactNode;
  warning: ReactNode;
  over: ReactNode;
  noBudget: ReactNode;
  problem: ReactNode;
}

interface GoalListProps {
  monthDays: number;
  icons: GoalIcons;
}

interface GoalCardProps {
  goal: Goal;
  currency: string;
  monthDays: number;
  ownDaysLeft: boolean;
  icons: GoalIcons;
}

const RING_RADIUS = 36;
const TONE_TEXT: Record<StatusTone, string> = {
  success: "text-success-text",
  warning: "text-warning-text",
  muted: "text-muted-foreground",
};

function Ring({ goal, headingId }: { goal: Goal; headingId: string }): ReactNode {
  const fill = ringFill(goal.percentageUsed);
  const stroke = goal.status === "warning" ? "stroke-warning-ring" : "stroke-primary";
  return (
    <span
      role="progressbar"
      aria-labelledby={headingId}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={fill}
      aria-valuetext={usedValue(goal.percentageUsed)}
      className={`relative grid place-items-center ${GOAL_RING}`}
    >
      <svg viewBox="0 0 84 84" className="absolute inset-0" focusable={false} aria-hidden>
        <circle cx="42" cy="42" r={RING_RADIUS} strokeWidth="12" className="fill-none stroke-track" />
        {fill > 0 && (
          <circle
            cx="42"
            cy="42"
            r={RING_RADIUS}
            strokeWidth="12"
            pathLength={100}
            strokeDasharray={`${fill} 100`}
            transform="rotate(-90 42 42)"
            className={`fill-none ${stroke}`}
          />
        )}
      </svg>
      <span aria-hidden className="relative grid justify-items-center leading-none">
        <span className="text-goal font-bold">{ringCentre(goal.percentageUsed)}</span>
        <span className="mt-1 text-(length:--text-ring) text-muted-foreground">used</span>
      </span>
    </span>
  );
}

function GoalCard({ goal, currency, monthDays, ownDaysLeft, icons }: GoalCardProps): ReactNode {
  const headingId = useId();
  const status = goalStatus(goal.status);
  const hasBudget = goal.monthlyBudget > 0;
  const projected = projection(goal, monthDays);
  const pace = paceLine(goal, projected);
  const budget = formatCurrency(goal.monthlyBudget, currency);

  return (
    <article className="flex items-center gap-4">
      {hasBudget ? (
        <Ring goal={goal} headingId={headingId} />
      ) : (
        <span
          aria-hidden
          className={`grid place-items-center rounded-circle bg-soft text-muted-foreground ${GOAL_RING}`}
        >
          {icons.noBudget}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 id={headingId} className="text-h3 font-bold">
            {goal.category}
          </h3>
          {status && (
            <p className={`flex items-center gap-1.5 text-xs font-bold ${TONE_TEXT[status.tone]}`}>
              {status.tone !== "muted" && icons[status.tone]}
              {status.words}
            </p>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="text-goal-spent font-bold text-foreground">
            {formatCurrency(goal.currentSpent, currency)}
          </span>
          {hasBudget && ` of ${budget}`}
        </p>
        {ownDaysLeft && <p className="mt-1 text-sm text-muted-foreground">{daysLeft(goal.daysRemaining)}</p>}
        {projected && (
          <p className="mt-1 text-sm text-muted-foreground">
            {projected.kind === "early"
              ? "Too early to project"
              : `Projected ${formatCurrency(projected.amount, currency)} of ${budget}`}
          </p>
        )}
        {!hasBudget && <p className="mt-1 text-sm font-bold">No budget set</p>}
        {pace?.kind === "pace" && (
          <p className="mt-1.5 text-xs font-bold">On pace to exceed by {formatCurrency(pace.by, currency)}</p>
        )}
        {pace?.kind === "over" && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-danger-text">
            {icons.over}
            Over budget by {formatCurrency(pace.by, currency)}
          </p>
        )}
      </div>
    </article>
  );
}

export function GoalList({ monthDays, icons }: GoalListProps): ReactNode {
  const goals = useQuery(dashboardQueries.goals());
  const profile = useQuery(dashboardQueries.profile());
  const pending = goals.isPending || profile.isPending;

  function body(): ReactNode {
    if (pending) {
      return (
        <>
          <span aria-hidden className="mt-2 block h-4 w-40 animate-pulse rounded-6 bg-skeleton" />
          <GoalBars />
          <StillLoading pending />
        </>
      );
    }
    if (!goals.data || !profile.data) {
      const retry = (): void => {
        void goals.refetch();
        if (profile.isError) void profile.refetch();
      };
      return <SectionError block="goals" icon={icons.problem} onRetry={retry} className="mt-card-gap" />;
    }
    const refreshFailed = goals.isRefetchError && (
      <WarningStrip icon={icons.problem} message={refreshProblem("goals")} onRetry={() => void goals.refetch()} />
    );
    const list = goals.data.goals;
    if (list.length === 0) {
      return (
        <>
          {refreshFailed}
          <p className="mt-card-gap text-muted-foreground">No spending goals yet</p>
        </>
      );
    }
    const shared = sharedDaysLeft(list);

    return (
      <>
        <p className="mt-1 text-sm text-muted-foreground">{shared ? `This month · ${shared}` : "This month"}</p>
        {refreshFailed}
        <ul className={GOAL_LIST}>
          {list.map((goal, index) => (
            <li key={`${goal.id}-${index}`} className={GOAL_ITEM}>
              <GoalCard
                goal={goal}
                currency={profile.data.currency}
                monthDays={monthDays}
                ownDaysLeft={shared === null}
                icons={icons}
              />
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <section aria-labelledby="goals-heading" aria-busy={pending || undefined} className={GOAL_CARD}>
      <GoalsHeading />
      {body()}
    </section>
  );
}
