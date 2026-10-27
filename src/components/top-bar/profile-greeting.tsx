"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CUSTOMER_ID } from "@/lib/api/spending-api";
import { type DayPart, firstName, greetingText, profileSummary } from "@/lib/greeting";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { GreetingTooltip } from "./greeting-tooltip";

interface ProfileGreetingProps {
  dayPart: DayPart;
  today: string;
  children?: ReactNode;
}

export function ProfileGreeting({ dayPart, today, children }: ProfileGreetingProps): ReactNode {
  const profile = useQuery(dashboardQueries.profile());
  const loaded = profile.data?.customerId === CUSTOMER_ID ? profile.data : null;
  const loading = profile.isPending;
  let problem: string | null = null;
  if (loaded === null && !loading) problem = "Couldn't load profile";
  else if (profile.isError) problem = "Couldn't refresh profile";

  return (
    <div>
      <p className="text-greeting font-bold text-foreground">
        {loaded && (
          <GreetingTooltip
            greeting={greetingText(dayPart, firstName(loaded.name))}
            description={profileSummary(loaded, today)}
          />
        )}
        {loading && (
          <>
            {`Good ${dayPart}, `}
            <span aria-hidden className="inline-block h-5 w-20 animate-pulse rounded-6 bg-skeleton align-middle" />
          </>
        )}
        {loaded === null && !loading && greetingText(dayPart, null)}
      </p>

      {children}

      {problem && (
        <p className="mt-1 text-sm">
          <span className="font-semibold text-danger-text">{problem}</span>
          <span className="text-muted-foreground"> · </span>
          <button
            type="button"
            onClick={() => void profile.refetch()}
            className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2 lg:min-h-6"
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
