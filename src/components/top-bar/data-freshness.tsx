"use client";

import { type ReactNode, useState } from "react";
import { formatDay } from "@/lib/format";
import { useDashboardStatus } from "@/lib/query/use-dashboard-status";
import { formatSouthAfricaTime } from "@/lib/south-africa-time";

interface DataFreshnessProps {
  today: string;
}

function couldNotRefresh(sections: number): string {
  return sections === 1 ? "1 section couldn't refresh" : `${sections} sections couldn't refresh`;
}

export function DataFreshness({ today }: DataFreshnessProps): ReactNode {
  const status = useDashboardStatus();
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  if (status.allLoadedAt !== null && status.allLoadedAt !== lastUpdated) {
    setLastUpdated(status.allLoadedAt);
  }

  const parts = [`Data as of ${formatDay(today)}`];
  if (lastUpdated !== null) parts.push(`Updated ${formatSouthAfricaTime(new Date(lastUpdated))}`);
  if (lastUpdated !== null && !status.fetching && status.failedSections > 0) {
    parts.push(couldNotRefresh(status.failedSections));
  }

  return <p className="mt-1 text-sm text-muted-foreground">{parts.join(" · ")}</p>;
}
