import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specFilters } from "@/test/spec-samples";
import { FilterLabels, TransactionFilters } from "./transaction-filters";

const FILTERS_PATH = "*/api/customers/:customerId/filters";

function renderFilters(searchParams = "", onUrlUpdate: OnUrlUpdateFunction = vi.fn()) {
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams, onUrlUpdate });
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <NuqsAdapter>
        <h2 id="transactions-heading" tabIndex={-1}>
          Transactions
        </h2>
        <TransactionFilters caretIcon={null} datesOpener={<button type="button">Dates</button>} />
        <FilterLabels removeIcon={null} />
      </NuqsAdapter>
    </QueryClientProvider>,
  );
}

const optionLabels = (name: string) =>
  within(screen.getByRole("combobox", { name }))
    .getAllByRole("option")
    .map((option) => option.textContent);

describe("TransactionFilters", () => {
  it("offers All categories and the categories in the order the API sends them", async () => {
    renderFilters();
    await screen.findByRole("combobox", { name: "Category" });
    expect(optionLabels("Category")).toEqual(["All categories", ...specFilters.categories.map(({ name }) => name)]);
    expect(screen.getByRole("group", { name: "Transaction filters" })).toBeInTheDocument();
  });

  it("chooses a category from page 1 without a Back step, and All categories removes it", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderFilters("?page=3", onUrlUpdate);
    const select = await screen.findByRole("combobox", { name: "Category" });
    await userEvent.selectOptions(select, "Transportation");
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?category=Transportation");
    expect(onUrlUpdate.mock.calls[0]?.[0].options.history).toBe("replace");
    await userEvent.selectOptions(select, "All categories");
    expect(onUrlUpdate.mock.calls[1]?.[0].queryString).toBe("");
  });

  it.each([
    ["fails", () => HttpResponse.json({}, { status: 500 })],
    ["has no categories", () => HttpResponse.json({ ...specFilters, categories: [] })],
  ])("hides the category choice when the filters request %s, and sort and dates still show", async (_case, answer) => {
    server.use(http.get(FILTERS_PATH, answer));
    renderFilters();
    expect(await screen.findByRole("combobox", { name: "Sort" })).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("combobox", { name: "Category" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dates" })).toBeInTheDocument();
  });

  it("offers exactly four sort orders and sorts from page 1 without a Back step", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderFilters("?page=2", onUrlUpdate);
    expect(optionLabels("Sort")).toEqual([
      "Newest first",
      "Oldest first",
      "Amount: high to low",
      "Amount: low to high",
    ]);
    expect(screen.getByRole("combobox", { name: "Sort" })).toHaveValue("date_desc");
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sort" }), "Amount: high to low");
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?sort=amount_desc");
    expect(onUrlUpdate.mock.calls[0]?.[0].options.history).toBe("replace");
  });

  it("keeps a chosen category that isn't in the list selectable", async () => {
    renderFilters("?category=Pets");
    expect(await screen.findByRole("combobox", { name: "Category" })).toHaveValue("Pets");
  });
});

describe("FilterLabels", () => {
  it("shows nothing when no filter is set", () => {
    renderFilters("?sort=amount_asc");
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("shows a removable category label, a fixed dates label and Clear filters", async () => {
    renderFilters("?category=Dining&startDate=2024-09-01&endDate=2024-09-10");
    expect(screen.getByText("Category: Dining")).toBeInTheDocument();
    expect(screen.getByText("Dates: 1 Sep 2024 – 10 Sep 2024")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove filter Dining" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remove filter Dates/ })).not.toBeInTheDocument();
  });

  it("removes only the category, from page 1, and moves focus to the Transactions heading", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderFilters("?category=Dining&page=2&startDate=2024-09-01&endDate=2024-09-10", onUrlUpdate);
    await userEvent.click(screen.getByRole("button", { name: "Remove filter Dining" }));
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?startDate=2024-09-01&endDate=2024-09-10");
    expect(screen.getByRole("heading", { name: "Transactions" })).toHaveFocus();
  });

  it("Clear filters removes the category and dates, keeps the sort and the last period, and adds no Back step", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderFilters(
      "?period=90d&category=Dining&sort=amount_asc&page=2&startDate=2024-09-01&endDate=2024-09-10",
      onUrlUpdate,
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    const update = onUrlUpdate.mock.calls[0]?.[0];
    expect(update?.queryString).toBe("?period=90d&sort=amount_asc");
    expect(update?.options.history).toBe("replace");
    expect(screen.getByRole("heading", { name: "Transactions" })).toHaveFocus();
  });
});
