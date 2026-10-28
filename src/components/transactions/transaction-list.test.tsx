import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specTransactions } from "@/test/spec-samples";
import { TransactionList } from "./transaction-list";

const TRANSACTIONS_PATH = "*/api/customers/:customerId/transactions";
const CATEGORIES_PATH = "*/api/customers/:customerId/spending/categories";
const [PICK_N_PAY] = specTransactions.transactions;

function answerTransactions(rows: object[]) {
  server.use(http.get(TRANSACTIONS_PATH, () => HttpResponse.json({ ...specTransactions, transactions: rows })));
}

function renderList(searchParams = "") {
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams, hasMemory: true });
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <NuqsAdapter>
        <TransactionList
          problem={null}
          filters={null}
          removeIcon={null}
          previousIcon={null}
          nextIcon={null}
          infoIcon={null}
        />
      </NuqsAdapter>
    </QueryClientProvider>,
  );
}

const readable = (text: string | null) => (text ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
const table = () => screen.findByRole("table", { name: "Transactions" });
const tableRows = async () =>
  within(await table())
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole("cell")
        .map((cell) => readable(cell.textContent)),
    );
const phoneRows = () =>
  within(screen.getByRole("list", { name: "Transactions" }))
    .getAllByRole("listitem")
    .map((row) => readable(row.textContent));

describe("TransactionList", () => {
  it("shows placeholder rows under the heading while it loads", async () => {
    renderList();
    expect(await screen.findByRole("heading", { name: "Transactions" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Transactions" })).toHaveAttribute("aria-busy", "true");
  });

  it("shows the sample rows in a table with column headers, in South African time", async () => {
    renderList();
    expect(await tableRows()).toEqual([
      ["Pick n PayWeekly groceries", "Groceries · Credit Card", "16 Sep 2024, 16:30", "R 245,80"],
      ["NetflixMonthly subscription", "Entertainment · Debit Order", "15 Sep 2024, 12:15", "R 199,00"],
    ]);
    const headers = within(await table())
      .getAllByRole("columnheader")
      .map((header) => header.textContent);
    expect(headers).toEqual(["Merchant", "Category · Payment", "Date", "Amount"]);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows the same rows as a phone list, with the amount, date and time together", async () => {
    renderList();
    await table();
    expect(phoneRows()[0]).toBe("Pick n PayWeekly groceriesGroceries · Credit CardR 245,8016 Sep 202416:30");
  });

  it("handles an empty merchant, description or payment method, a bad date, a duplicate and an unknown category", async () => {
    answerTransactions([
      { ...PICK_N_PAY, id: "a", merchant: "", description: "Card fee" },
      { ...PICK_N_PAY, id: "b", description: "", paymentMethod: "" },
      { ...PICK_N_PAY, id: "c", date: "bad", category: "Pets", paymentMethod: "EFT" },
      { ...PICK_N_PAY, id: "c", merchant: "Duplicate" },
      { ...PICK_N_PAY, id: "d", amount: -245.8 },
    ]);
    renderList();
    expect(await tableRows()).toEqual([
      ["Card fee", "Groceries · Credit Card", "16 Sep 2024, 16:30", "R 245,80"],
      ["Pick n Pay", "Groceries", "16 Sep 2024, 16:30", "R 245,80"],
      ["Pick n PayWeekly groceries", "Pets · EFT", "—", "R 245,80"],
      ["Pick n PayWeekly groceries", "Groceries · Credit Card", "16 Sep 2024, 16:30", "-R 245,80"],
    ]);
  });

  it("shortens a long merchant name on screen but keeps all of it in the page", async () => {
    const long = "The Extraordinarily Long Merchant Name For Testing Purposes!";
    answerTransactions([{ ...PICK_N_PAY, merchant: long }]);
    renderList();
    const cell = within(await table()).getByText(long);
    expect(cell).toHaveClass("truncate");
    expect(long).toHaveLength(60);
  });

  it("shows the empty message when there are no transactions", async () => {
    answerTransactions([]);
    renderList();
    expect(await screen.findByText("No transactions in this period")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("says nothing matches, with Clear filters, when a filter is set and there are no rows", async () => {
    answerTransactions([]);
    renderList("?category=Dining");
    expect(await screen.findByText("No transactions match these filters")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Clear filters" })).toHaveLength(2);
    expect(screen.queryByText("No transactions in this period")).not.toBeInTheDocument();
  });

  it("asks for the chosen sort and shows the rows in the order they come back", async () => {
    const asked: string[] = [];
    server.use(
      http.get(TRANSACTIONS_PATH, ({ request }) => {
        asked.push(new URL(request.url).searchParams.get("sortBy") ?? "");
        const rows = ["t3", "t1", "t2"].map((id) => ({ ...PICK_N_PAY, id, merchant: id }));
        return HttpResponse.json({ ...specTransactions, transactions: rows });
      }),
    );
    renderList("?sort=amount_desc");
    const merchants = (await tableRows()).map(([merchant]) => merchant?.slice(0, 2));
    expect(merchants).toEqual(["t3", "t1", "t2"]);
    expect(asked).toEqual(["amount_desc"]);
  });

  it("Next swaps in the next page's rows instead of adding them, with Loading page… meanwhile", async () => {
    let releasePage2: () => void = () => {};
    server.use(
      http.get(TRANSACTIONS_PATH, async ({ request }) => {
        const offset = Number(new URL(request.url).searchParams.get("offset"));
        if (offset === 20) await new Promise<void>((resolve) => (releasePage2 = resolve));
        const rows = [1, 2].map((n) => ({ ...PICK_N_PAY, id: `p${offset}-${n}`, merchant: `Row ${offset + n}` }));
        return HttpResponse.json({ transactions: rows, pagination: { total: 1250, limit: 20, offset, hasMore: true } });
      }),
    );
    renderList();
    await table();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Loading page…");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect((await tableRows()).map(([merchant]) => merchant)).toEqual([
      "Row 1Weekly groceries",
      "Row 2Weekly groceries",
    ]);
    releasePage2();
    await screen.findByText("Row 21", { selector: "td span" });
    expect((await tableRows()).map(([merchant]) => merchant)).toEqual([
      "Row 21Weekly groceries",
      "Row 22Weekly groceries",
    ]);
    expect(screen.queryByText("Loading page…")).not.toBeInTheDocument();
  });

  it("keeps the current page and offers Retry when the next page fails", async () => {
    let page2Calls = 0;
    server.use(
      http.get(TRANSACTIONS_PATH, ({ request }) => {
        const offset = Number(new URL(request.url).searchParams.get("offset"));
        if (offset === 20) {
          page2Calls += 1;
          if (page2Calls === 1) return HttpResponse.json({}, { status: 500 });
        }
        const rows = [{ ...PICK_N_PAY, id: `p${offset}`, merchant: `Row ${offset + 1}` }];
        return HttpResponse.json({ transactions: rows, pagination: { total: 1250, limit: 20, offset, hasMore: true } });
      }),
    );
    renderList();
    await table();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Couldn't load page 2. Still showing page 1.")).toBeInTheDocument();
    expect((await tableRows())[0]?.[0]).toBe("Row 1Weekly groceries");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByText("Row 21", { selector: "td span" });
    expect(screen.queryByText(/Couldn't load page/)).not.toBeInTheDocument();
  });

  it("offers Back to first page when the page asked for is past the end", async () => {
    server.use(
      http.get(TRANSACTIONS_PATH, () =>
        HttpResponse.json({ transactions: [], pagination: { total: 30, limit: 20, offset: 40, hasMore: false } }),
      ),
    );
    renderList("?page=3");
    expect(await screen.findByRole("button", { name: "Back to first page" })).toBeInTheDocument();
    expect(screen.queryByText("No transactions in this period")).not.toBeInTheDocument();
  });

  it("shows the rows without paging when the API leaves pagination out", async () => {
    server.use(http.get(TRANSACTIONS_PATH, () => HttpResponse.json({ transactions: specTransactions.transactions })));
    renderList();
    expect(await tableRows()).toHaveLength(2);
    expect(screen.queryByRole("navigation", { name: "Transaction pages" })).not.toBeInTheDocument();
  });

  it("shows an error with Retry, and Retry asks again", async () => {
    let calls = 0;
    server.use(
      http.get(TRANSACTIONS_PATH, () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(specTransactions);
      }),
    );
    renderList();
    expect(await screen.findByText("Couldn't load transactions")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await tableRows()).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("asks for page 1 of the period's dates, sorted newest first", async () => {
    const asked: string[] = [];
    server.use(
      http.get(TRANSACTIONS_PATH, ({ request }) => {
        asked.push(new URL(request.url).search);
        return HttpResponse.json(specTransactions);
      }),
    );
    renderList();
    await table();
    expect(asked).toEqual(["?limit=20&offset=0&sortBy=date_desc&startDate=2024-08-16&endDate=2024-09-16"]);
  });

  it("asks for the selected category and custom dates without waiting for the period", async () => {
    const asked: string[] = [];
    server.use(
      http.get(TRANSACTIONS_PATH, ({ request }) => {
        asked.push(new URL(request.url).search);
        return HttpResponse.json(specTransactions);
      }),
    );
    renderList("?category=Dining&startDate=2024-09-01&endDate=2024-09-10");
    await table();
    expect(asked).toEqual([
      "?limit=20&offset=0&sortBy=date_desc&category=Dining&startDate=2024-09-01&endDate=2024-09-10",
    ]);
  });

  it("asks without dates when the period's dates can't be loaded", async () => {
    const asked: string[] = [];
    server.use(
      http.get(CATEGORIES_PATH, () => HttpResponse.json({}, { status: 500 })),
      http.get(TRANSACTIONS_PATH, ({ request }) => {
        asked.push(new URL(request.url).search);
        return HttpResponse.json(specTransactions);
      }),
    );
    renderList();
    await table();
    expect(asked).toEqual(["?limit=20&offset=0&sortBy=date_desc"]);
  });
});
