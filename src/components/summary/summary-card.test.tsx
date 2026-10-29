import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specSummary } from "@/test/spec-samples";
import { SummaryCard } from "./summary-card";

const ICONS = {
  wallet: null,
  arrows: { up: <svg data-testid="up" />, down: <svg data-testid="down" />, same: <svg data-testid="same" /> },
  problem: null,
  note: null,
};

const SUMMARY_PATH = "*/api/customers/:customerId/spending/summary";

function answerSummary(body: object) {
  server.use(http.get(SUMMARY_PATH, () => HttpResponse.json(body)));
}

function renderCard(searchParams = "") {
  const client = makeQueryClient();
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams });
  render(
    <QueryClientProvider client={client}>
      <NuqsAdapter>
        <SummaryCard icons={ICONS} />
      </NuqsAdapter>
    </QueryClientProvider>,
  );
  return client;
}

const card = () => screen.findByRole("region", { name: "Spending summary" });
const figures = async () => {
  await screen.findByText("Transactions");
  return card();
};
const valueOf = (term: string) => screen.getByText(term, { selector: "dt" }).nextElementSibling;

describe("SummaryCard", () => {
  it("shows a placeholder the size of the card while it loads", async () => {
    renderCard();
    expect(await card()).toHaveAttribute("aria-busy", "true");
  });

  it("shows the four figures as labelled pairs, with both changes in words", async () => {
    answerSummary(specSummary);
    renderCard();
    await figures();
    expect(screen.getByText("Spent · Last 30 days", { selector: "dt" })).toBeInTheDocument();
    expect(valueOf("Spent · Last 30 days")).toHaveTextContent("R 4 250,75");
    expect(valueOf("Transactions")).toHaveTextContent("47");
    expect(valueOf("Average transaction")).toHaveTextContent("R 90,44");
    expect(valueOf("Top category")).toHaveTextContent("Groceries");
    expect(screen.getByText("Up 12,5% on previous period")).toContainElement(screen.getByTestId("up"));
    expect(screen.getByText("Down 3,2% on previous period")).toContainElement(screen.getByTestId("down"));
  });

  it("hides only the change that wasn't sent", async () => {
    answerSummary({ ...specSummary, comparedToPrevious: { spentChange: 12.5 } });
    renderCard();
    await figures();
    expect(screen.getByText("Up 12,5% on previous period")).toBeInTheDocument();
    expect(screen.queryByText(/Down/)).not.toBeInTheDocument();
  });

  it("shows the empty version when there were no transactions", async () => {
    answerSummary({ ...specSummary, totalSpent: 0, transactionCount: 0, averageTransaction: 0, topCategory: "" });
    renderCard();
    await figures();
    expect(valueOf("Spent · Last 30 days")).toHaveTextContent("R 0,00");
    expect(screen.getByText("No spending in this period")).toBeInTheDocument();
    expect(valueOf("Transactions")).toHaveTextContent("0");
    expect(valueOf("Average transaction")).toHaveTextContent("—");
    expect(valueOf("Top category")).toHaveTextContent("—");
    expect(screen.queryByText(/previous period/)).not.toBeInTheDocument();
  });

  it("shows the preset-only note and no figures while custom dates are on", async () => {
    renderCard("?startDate=2024-09-01&endDate=2024-09-16");
    expect(await card()).toHaveTextContent("Summary is available for preset periods only");
    expect(screen.queryByText("Transactions")).not.toBeInTheDocument();
  });

  it("shows an error with Retry, and Retry asks again", async () => {
    let calls = 0;
    server.use(
      http.get(SUMMARY_PATH, () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(specSummary);
      }),
    );
    renderCard();
    const panel = await screen.findByText("Couldn't load summary");
    await userEvent.click(within(panel.closest("section") as HTMLElement).getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("R 4 250,75")).toBeInTheDocument();
    expect(calls).toBe(2);
  });
});

describe("refresh failure", () => {
  it("keeps the earlier summary when a refresh fails, and Retry asks for them again", async () => {
    const client = renderCard();
    await screen.findByText("R 4 250,75");
    let calls = 0;
    server.use(
      http.get(SUMMARY_PATH, () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(specSummary);
      }),
    );
    await act(() => client.refetchQueries());
    expect(await screen.findByText("Couldn't refresh summary. Showing earlier data.")).toBeInTheDocument();
    expect(screen.getByText("R 4 250,75")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.queryByText(/^Couldn't refresh/)).not.toBeInTheDocument());
    expect(calls).toBe(2);
  });
});
