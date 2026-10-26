import { act, renderHook } from "@testing-library/react";
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { useDashboardParams } from "./use-dashboard-params";

function renderWithUrl(searchParams: string, onUrlUpdate: OnUrlUpdateFunction = vi.fn()) {
  return renderHook(() => useDashboardParams(), { wrapper: withNuqsTestingAdapter({ searchParams, onUrlUpdate }) });
}

describe("useDashboardParams", () => {
  it("reads the dashboard's choices from the address bar", () => {
    const { result } = renderWithUrl("?period=90d&category=Dining&page=2");
    expect(result.current[0]).toMatchObject({ period: "90d", category: "Dining", page: 2, sort: "date_desc" });
  });

  it("replaces the history entry by default, so filters don't pile up Back steps", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const { result } = renderWithUrl("", onUrlUpdate);
    await act(() => result.current[1]({ sort: "amount_desc", page: 1 }));
    expect(onUrlUpdate).toHaveBeenCalledOnce();
    expect(onUrlUpdate.mock.calls[0]?.[0].options.history).toBe("replace");
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?sort=amount_desc");
  });

  it("can push a history entry when a category is chosen from the breakdown", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const { result } = renderWithUrl("", onUrlUpdate);
    await act(() => result.current[1]({ category: "Groceries", page: 1 }, { history: "push" }));
    expect(onUrlUpdate.mock.calls[0]?.[0].options.history).toBe("push");
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?category=Groceries");
  });

  it("keeps defaults out of the address bar", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const { result } = renderWithUrl("?period=7d", onUrlUpdate);
    await act(() => result.current[1]({ period: "30d" }));
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("");
  });

  it("writes a custom range and a page number back to the address bar", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const { result } = renderWithUrl("", onUrlUpdate);
    await act(() => result.current[1]({ startDate: "2024-09-01", endDate: "2024-09-16", page: 3 }));
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?startDate=2024-09-01&endDate=2024-09-16&page=3");
  });
});
