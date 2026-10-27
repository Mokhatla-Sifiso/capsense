import { type UseQueryStatesReturn, useQueryStates } from "nuqs";
import { dashboardParams } from "./dashboard-params";

export function useDashboardParams(): UseQueryStatesReturn<typeof dashboardParams> {
  return useQueryStates(dashboardParams);
}
