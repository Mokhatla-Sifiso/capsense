import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specGoals, specProfile } from "@/test/spec-samples";
import { DataFreshness } from "./data-freshness";
import { RefreshButton } from "./refresh-button";

const refreshServerParts = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshServerParts }) }));

function Sections() {
  useQuery(dashboardQueries.profile());
  useQuery(dashboardQueries.goals());
  return null;
}

function countRequests(goalsStatus = 200) {
  const calls = { profile: 0, goals: 0 };
  server.use(
    http.get("*/api/customers/:customerId/profile", async () => {
      calls.profile += 1;
      await delay(150);
      return HttpResponse.json(specProfile);
    }),
    http.get("*/api/customers/:customerId/goals", async () => {
      calls.goals += 1;
      await delay(150);
      return goalsStatus === 200 ? HttpResponse.json(specGoals) : HttpResponse.json({}, { status: goalsStatus });
    }),
  );
  return calls;
}

async function renderLoaded() {
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <Sections />
      <RefreshButton />
      <DataFreshness today="2024-09-16" />
    </QueryClientProvider>,
  );
  await screen.findByText(/Updated/);
}

describe("RefreshButton", () => {
  afterEach(() => {
    refreshServerParts.mockClear();
  });

  it("is named 'Refresh data' and shows the word Refresh on wide screens", async () => {
    await renderLoaded();
    const button = screen.getByRole("button", { name: "Refresh data" });
    expect(button).toHaveTextContent("Refresh");
  });

  it("asks every section once, however many times it's pressed while running", async () => {
    await renderLoaded();
    const calls = countRequests();
    const button = screen.getByRole("button", { name: "Refresh data" });

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveTextContent("Refreshing…");
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    await waitFor(() => expect(button).toHaveAttribute("aria-disabled", "false"));
    expect(calls).toEqual({ profile: 1, goals: 1 });
    expect(refreshServerParts).toHaveBeenCalledTimes(1);
  });

  it("announces once when it starts and once when it ends", async () => {
    await renderLoaded();
    countRequests();
    await userEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    expect(screen.getByRole("status")).toHaveTextContent("Refreshing data…");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Data refreshed"));
  });

  it("says how many sections couldn't refresh", async () => {
    await renderLoaded();
    countRequests(500);
    await userEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Data refreshed · 1 section couldn't refresh"),
    );
    expect(
      screen.getByText(/^Data as of 16 Sep 2024 · Updated \d{2}:\d{2} · 1 section couldn't refresh$/),
    ).toBeInTheDocument();
  });

  it("moves the Updated time when every section succeeds", async () => {
    vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2024-09-16T13:00:00Z"));
    await renderLoaded();
    expect(screen.getByText("Data as of 16 Sep 2024 · Updated 15:00")).toBeInTheDocument();
    countRequests();
    vi.setSystemTime(new Date("2024-09-16T14:05:00Z"));
    await userEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    expect(await screen.findByText("Data as of 16 Sep 2024 · Updated 16:05")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
