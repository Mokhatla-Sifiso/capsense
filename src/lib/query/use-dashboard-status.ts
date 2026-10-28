import { type Query, type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";
import { dashboardKeys } from "./dashboard-queries";

export function couldNotRefresh(sections: number): string {
  return sections === 1 ? "1 section couldn't refresh" : `${sections} sections couldn't refresh`;
}

function shownSections(client: QueryClient): Query[] {
  return client
    .getQueryCache()
    .findAll({ queryKey: dashboardKeys.all })
    .filter((query) => query.getObserversCount() > 0 && query.queryKey[1] !== "filters");
}

export function failedSectionCount(client: QueryClient): number {
  return shownSections(client).filter((section) => section.state.status === "error").length;
}

export interface DashboardStatus {
  fetching: boolean;
  failedSections: number;
  allLoadedAt: number | null;
}

function readStatus(client: QueryClient): string {
  const sections = shownSections(client);
  const fetching = sections.some((section) => section.state.fetchStatus === "fetching");
  const failedSections = sections.filter((section) => section.state.status === "error").length;
  const everyLoaded = sections.length > 0 && sections.every((section) => section.state.dataUpdatedAt > 0);
  const status: DashboardStatus = {
    fetching,
    failedSections,
    allLoadedAt:
      everyLoaded && !fetching && failedSections === 0
        ? Math.max(...sections.map((section) => section.state.dataUpdatedAt))
        : null,
  };
  return JSON.stringify(status);
}

export function useDashboardStatus(): DashboardStatus {
  const client = useQueryClient();
  const status = useSyncExternalStore(
    (onChange) => client.getQueryCache().subscribe(onChange),
    () => readStatus(client),
    () => readStatus(client),
  );
  return useMemo(() => JSON.parse(status) as DashboardStatus, [status]);
}
