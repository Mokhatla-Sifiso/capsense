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
  const failed = profile.isError || (profile.isSuccess && loaded === null);

  return (
    <div>
      <p className="text-greeting font-bold text-foreground">
        {loaded && (
          <GreetingTooltip
            greeting={greetingText(dayPart, firstName(loaded.name))}
            description={profileSummary(loaded, today)}
          />
        )}
        {profile.isPending && (
          <>
            {`Good ${dayPart}, `}
            <span aria-hidden className="inline-block h-5 w-20 animate-pulse rounded-6 bg-skeleton align-middle" />
          </>
        )}
        {failed && greetingText(dayPart, null)}
      </p>

      {children}

      {failed && (
        <p className="mt-1 text-sm">
          <span className="font-semibold text-danger-text">Couldn&apos;t load profile</span>
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
