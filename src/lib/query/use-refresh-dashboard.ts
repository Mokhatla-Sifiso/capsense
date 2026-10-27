import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { dashboardKeys } from "./dashboard-queries";
import { couldNotRefresh, failedSectionCount } from "./use-dashboard-status";

interface RefreshDashboard {
  refreshing: boolean;
  announcement: string;
  refresh: () => void;
}

export function useRefreshDashboard(): RefreshDashboard {
  const client = useQueryClient();
  const router = useRouter();
  const inFlight = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  async function refreshEverySection(): Promise<void> {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    setAnnouncement("Refreshing data…");

    router.refresh();
    await client.refetchQueries({ queryKey: dashboardKeys.all, type: "active" });

    const failed = failedSectionCount(client);
    setAnnouncement(failed === 0 ? "Data refreshed" : `Data refreshed · ${couldNotRefresh(failed)}`);
    setRefreshing(false);
    inFlight.current = false;
  }

  return { refreshing, announcement, refresh: () => void refreshEverySection() };
}
