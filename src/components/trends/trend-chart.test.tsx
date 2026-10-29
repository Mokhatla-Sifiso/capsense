import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specTrends } from "@/test/spec-samples";
import { TrendChart } from "./trend-chart";

const TRENDS_PATH = "*/api/customers/:customerId/spending/trends";

class FixedWidthObserver {
  constructor(private readonly report: ResizeObserverCallback) {}
  observe(): void {
    this.report([{ contentRect: { width: 360 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
  disconnect(): void {}
  unobserve(): void {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", FixedWidthObserver);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

function answerTrends(trends: object[]) {
  server.use(http.get(TRENDS_PATH, () => HttpResponse.json({ trends })));
}

function renderChart(searchParams = "", onUrlUpdate?: OnUrlUpdateFunction) {
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams, onUrlUpdate, hasMemory: true });
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <NuqsAdapter>
        <TrendChart problem={null} caretIcon={null} />
      </NuqsAdapter>
    </QueryClientProvider>,
  );
}

const readable = (text: string | null) => (text ?? "").replace(/ /g, " ");
const chart = () => screen.findByRole("group", { name: "Monthly spending chart" });
const columns = async () => within(await chart()).getAllByRole("button");
const strip = () => readable(screen.getByText(/ transactions? · avg /).closest("p")?.textContent ?? null);
const month = (iso: string, totalSpent = 100, transactionCount = 2) => ({
  month: iso,
  totalSpent,
  transactionCount,
  averageTransaction: transactionCount ? totalSpent / transactionCount : 0,
});

describe("TrendChart", () => {
  it("shows placeholder columns under the heading while it loads", async () => {
    renderChart();
    expect(await screen.findByRole("heading", { name: "Monthly trends" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Monthly trends" })).toHaveAttribute("aria-busy", "true");
  });

  it("shows one column per month in order, with June selected and read out in full", async () => {
    renderChart();
    const names = (await columns()).map((column) => readable(column.getAttribute("aria-label")));
    expect(names).toEqual([
      "January 2024: R 3 890,25, 42 transactions, average R 92,62",
      "February 2024: R 4 150,80, 38 transactions, average R 109,23",
      "March 2024: R 3 750,60, 45 transactions, average R 83,35",
      "April 2024: R 4 200,45, 39 transactions, average R 107,70",
      "May 2024: R 3 980,30, 44 transactions, average R 90,46",
      "June 2024: R 4 250,75, 47 transactions, average R 90,44",
    ]);
    const selected = (await columns()).filter((column) => column.getAttribute("aria-pressed") === "true");
    expect(selected.map((column) => readable(column.getAttribute("aria-label")).split(":")[0])).toEqual(["June 2024"]);
    expect(strip()).toBe("June 202447 transactions · avg R 90,44");
    expect(readable(screen.getByText("R 4 250,75", { selector: "text" }).textContent)).toBe("R 4 250,75");
  });

  it("labels the months short, with the year on the first column", async () => {
    renderChart();
    await chart();
    const labels = screen.getAllByText(/^(Jan|Feb|Mar|Apr|May|Jun)( \d\d)?$/).map((label) => label.textContent);
    expect(labels).toEqual(["Jan 24", "Feb", "Mar", "Apr", "May", "Jun"]);
  });

  it("selects a month on click, and the bubble and strip follow", async () => {
    renderChart();
    const march = (await columns())[2];
    if (!march) throw new Error("no March column");
    await userEvent.click(march);
    expect(march).toHaveAttribute("aria-pressed", "true");
    expect(strip()).toBe("March 202445 transactions · avg R 83,35");
    expect(screen.getByText("R 3 750,60", { selector: "text" })).toBeInTheDocument();
  });

  it("moves the selection with the arrow keys, Home and End, keeping one tab stop", async () => {
    renderChart();
    const all = await columns();
    expect(all.filter((column) => column.tabIndex === 0)).toHaveLength(1);
    all.at(-1)?.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(all[4]).toHaveFocus();
    expect(all[4]).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Home}");
    expect(all[0]).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(all[0]).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(all[5]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a single month as one selected column", async () => {
    answerTrends([month("2024-06", 4250.75, 47)]);
    renderChart();
    const only = await columns();
    expect(only).toHaveLength(1);
    expect(only[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("leaves a gap for a missing month, and the arrow keys skip it", async () => {
    answerTrends([month("2024-01"), month("2024-03")]);
    renderChart();
    const both = await columns();
    expect(both.map((column) => column.getAttribute("aria-label")?.split(":")[0])).toEqual([
      "January 2024",
      "March 2024",
    ]);
    both[1]?.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(both[0]).toHaveFocus();
  });

  it("drops an impossible month, shows a zero month, and has no average without transactions", async () => {
    answerTrends([month("2024-13"), month("2024-05", 0, 0), month("2024-06", 100, 1)]);
    renderChart();
    const shown = await columns();
    expect(shown.map((column) => readable(column.getAttribute("aria-label")))).toEqual([
      "May 2024: R 0,00, 0 transactions, no average",
      "June 2024: R 100,00, 1 transaction, average R 100,00",
    ]);
    await userEvent.click(shown[0] as HTMLElement);
    expect(strip()).toBe("May 20240 transactions · avg —");
  });

  it("shows the year at a year boundary", async () => {
    answerTrends([month("2023-12"), month("2024-01")]);
    renderChart();
    await chart();
    expect(screen.getAllByText(/^(Dec|Jan)( \d\d)?$/).map((label) => label.textContent)).toEqual(["Dec 23", "Jan 24"]);
  });

  it("shows the empty message when there are no months", async () => {
    answerTrends([]);
    renderChart();
    expect(await screen.findByText("No monthly spending to show")).toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("shows an error with Retry, and Retry asks again", async () => {
    let calls = 0;
    server.use(
      http.get(TRENDS_PATH, () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(specTrends);
      }),
    );
    renderChart();
    expect(await screen.findByText("Couldn't load trends")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await columns()).toHaveLength(6);
    expect(calls).toBe(2);
  });

  it("asks for the months in the address, 12 by default", async () => {
    const asked: string[] = [];
    server.use(
      http.get(TRENDS_PATH, ({ request }) => {
        asked.push(new URL(request.url).searchParams.get("months") ?? "");
        return HttpResponse.json(specTrends);
      }),
    );
    renderChart();
    await chart();
    expect(asked).toEqual(["12"]);
  });
});

describe("TrendChart months", () => {
  const note = () => screen.queryByText(/^Showing the \d+ months? available/);
  const monthsSelect = () => screen.getByRole("combobox", { name: "Months" });

  function answerByMonths(asked: string[]) {
    server.use(
      http.get(TRENDS_PATH, ({ request }) => {
        const months = new URL(request.url).searchParams.get("months") ?? "";
        asked.push(months);
        return HttpResponse.json(months === "24" ? { trends: [month("2023-12"), ...specTrends.trends] } : specTrends);
      }),
    );
  }

  it("offers exactly 3, 6, 12 and 24 months, with 12 chosen when nothing is in the address", async () => {
    renderChart();
    await chart();
    const options = within(monthsSelect()).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["3 months", "6 months", "12 months", "24 months"]);
    expect(monthsSelect()).toHaveValue("12");
  });

  it("asks for 24 months when chosen, replacing the address entry instead of adding a Back step", async () => {
    const asked: string[] = [];
    answerByMonths(asked);
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderChart("", onUrlUpdate);
    await chart();
    await userEvent.selectOptions(monthsSelect(), "24");
    expect(await columns()).toHaveLength(7);
    expect(asked).toEqual(["12", "24"]);
    expect(onUrlUpdate).toHaveBeenCalledTimes(1);
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?months=24");
    expect(onUrlUpdate.mock.calls[0]?.[0].options.history).toBe("replace");
  });

  it("selects the latest month again after the months change", async () => {
    answerByMonths([]);
    renderChart();
    await userEvent.click((await columns())[2] as HTMLElement);
    expect(strip()).toMatch(/^March 2024/);
    await userEvent.selectOptions(monthsSelect(), "24");
    expect(await columns()).toHaveLength(7);
    expect(strip()).toMatch(/^June 2024/);
  });

  it("notes when fewer months come back than were asked for", async () => {
    renderChart();
    await chart();
    expect(note()).toHaveTextContent("Showing the 6 months available of the 12 requested.");
  });

  it("has no note when as many months come back as were asked for", async () => {
    renderChart("?months=6");
    await chart();
    expect(note()).not.toBeInTheDocument();
  });

  it("says month, not months, when only 1 comes back", async () => {
    answerTrends([month("2024-06")]);
    renderChart("?months=3");
    await chart();
    expect(note()).toHaveTextContent("Showing the 1 month available of the 3 requested.");
  });

  it("has no note when there are no months", async () => {
    answerTrends([]);
    renderChart();
    expect(await screen.findByText("No monthly spending to show")).toBeInTheDocument();
    expect(note()).not.toBeInTheDocument();
  });

  it("falls back to 12 months for a number of months that isn't offered", async () => {
    const asked: string[] = [];
    answerByMonths(asked);
    renderChart("?months=7");
    await chart();
    expect(monthsSelect()).toHaveValue("12");
    expect(asked).toEqual(["12"]);
  });
});

describe("TrendChart data table", () => {
  const toggle = () => screen.getByRole("button", { name: /data table$/ });
  const table = () => screen.getByRole("table", { hidden: true });
  const rows = () =>
    within(table())
      .getAllByRole("row", { hidden: true })
      .map((row) => readable(row.textContent));

  it("keeps the table collapsed until Show data table is chosen", async () => {
    renderChart();
    await chart();
    expect(toggle()).toHaveTextContent("Show data table");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(table()).not.toBeVisible();
    await userEvent.click(toggle());
    expect(toggle()).toHaveTextContent("Hide data table");
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(toggle()).toHaveAttribute("aria-controls", table().id);
    expect(table()).toBeVisible();
  });

  it("lists every month with what was spent, the count and the average", async () => {
    renderChart();
    await chart();
    await userEvent.click(toggle());
    expect(screen.getByRole("table", { name: "Monthly spending" })).toBeInTheDocument();
    expect(rows()).toEqual([
      "MonthSpentCountAverage",
      "January 2024R 3 890,2542R 92,62",
      "February 2024R 4 150,8038R 109,23",
      "March 2024R 3 750,6045R 83,35",
      "April 2024R 4 200,4539R 107,70",
      "May 2024R 3 980,3044R 90,46",
      "June 2024R 4 250,7547R 90,44",
    ]);
    expect(screen.getByRole("rowheader", { name: "June 2024" })).toBeInTheDocument();
  });

  it("shows a dash for the average of a month without transactions, and leaves out gaps", async () => {
    answerTrends([month("2024-03", 0, 0), month("2024-05", 100, 1)]);
    renderChart();
    await chart();
    await userEvent.click(toggle());
    expect(rows().slice(1)).toEqual(["March 2024R 0,000—", "May 2024R 100,001R 100,00"]);
  });

  it("stays open with the new months after the months change", async () => {
    server.use(
      http.get(TRENDS_PATH, ({ request }) =>
        HttpResponse.json(
          new URL(request.url).searchParams.get("months") === "3"
            ? { trends: specTrends.trends.slice(-3) }
            : specTrends,
        ),
      ),
    );
    renderChart();
    await chart();
    await userEvent.click(toggle());
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Months" }), "3");
    expect(await columns()).toHaveLength(3);
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(
      rows()
        .slice(1)
        .map((row) => row.split("R")[0]),
    ).toEqual(["April 2024", "May 2024", "June 2024"]);
  });

  it("has no table when there are no months", async () => {
    answerTrends([]);
    renderChart();
    expect(await screen.findByText("No monthly spending to show")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /data table$/ })).not.toBeInTheDocument();
  });
});
