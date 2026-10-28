import { type QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { dashboardKeys, dashboardQueries } from "@/lib/query/dashboard-queries";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { DataFreshness } from "./data-freshness";

function ProfileSection() {
  useQuery(dashboardQueries.profile());
  return null;
}

function GoalsSection() {
  useQuery(dashboardQueries.goals());
  return null;
}

function PeriodOptions() {
  useQuery(dashboardQueries.filters());
  return null;
}

function renderLine(today = "2024-09-16", client: QueryClient = makeQueryClient()) {
  render(
    <QueryClientProvider client={client}>
      <ProfileSection />
      <GoalsSection />
      <PeriodOptions />
      <DataFreshness today={today} />
    </QueryClientProvider>,
  );
  return client;
}

const goalsFail = () =>
  server.use(http.get("*/api/customers/:customerId/goals", () => HttpResponse.json({}, { status: 500 })));

describe("DataFreshness", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2024-09-16T13:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the fixed demo date, never the device date", () => {
    vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
    renderLine("2024-03-31");
    expect(screen.getByText(/^Data as of 31 Mar 2024/)).toBeInTheDocument();
  });

  it("adds the time once every section has loaded, in South African time", async () => {
    renderLine();
    expect(screen.getByText("Data as of 16 Sep 2024")).toBeInTheDocument();
    expect(await screen.findByText("Data as of 16 Sep 2024 · Updated 15:00")).toBeInTheDocument();
  });

  it("hides the time while any section has never loaded", async () => {
    goalsFail();
    renderLine();
    await screen.findByText("Data as of 16 Sep 2024");
    await act(() => Promise.resolve());
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it("hides the time while a section is still waiting to ask for its data", async () => {
    function WaitingSection() {
      useQuery({ ...dashboardQueries.goals(), enabled: false });
      return null;
    }
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <ProfileSection />
        <WaitingSection />
        <DataFreshness today="2024-09-16" />
      </QueryClientProvider>,
    );
    await screen.findByText("Data as of 16 Sep 2024");
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it("keeps the previous time and counts the sections that failed to refresh, then moves on when they recover", async () => {
    const client = renderLine();
    await screen.findByText("Data as of 16 Sep 2024 · Updated 15:00");

    vi.setSystemTime(new Date("2024-09-16T14:05:00Z"));
    goalsFail();
    await act(() => client.refetchQueries({ queryKey: dashboardKeys.all }));
    expect(screen.getByText("Data as of 16 Sep 2024 · Updated 15:00 · 1 section couldn't refresh")).toBeInTheDocument();

    server.resetHandlers();
    await act(() => client.refetchQueries({ queryKey: dashboardKeys.goals() }));
    expect(screen.getByText("Data as of 16 Sep 2024 · Updated 16:05")).toBeInTheDocument();
  });

  it("doesn't count the period options as a section, because the spec's list stands in for them", async () => {
    server.use(http.get("*/api/customers/:customerId/filters", () => HttpResponse.json({}, { status: 500 })));
    renderLine();
    expect(await screen.findByText("Data as of 16 Sep 2024 · Updated 15:00")).toBeInTheDocument();
  });
});
