import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specSummary } from "@/test/spec-samples";
import { PeriodChoice } from "./period-choice";

function renderChoice(searchParams = "", onUrlUpdate: OnUrlUpdateFunction = vi.fn()) {
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams, onUrlUpdate });
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <NuqsAdapter>
        <PeriodChoice checkIcon={<svg data-testid="check" />} caretIcon={null} calendarIcon={null} />
      </NuqsAdapter>
    </QueryClientProvider>,
  );
}

const radios = () => screen.findByRole("radiogroup", { name: "Period" });

describe("PeriodChoice", () => {
  it("shows a placeholder until the options arrive", async () => {
    renderChoice();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(await radios()).toBeInTheDocument();
  });

  it("selects Last 30 days when nothing is chosen, with a tick on the selected option only", async () => {
    renderChoice();
    const group = await radios();
    expect(within(group).getByRole("radio", { name: "Last 30 days" })).toBeChecked();
    expect(within(group).getAllByTestId("check")).toHaveLength(1);
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveValue("30d");
  });

  it("selects the period from the address", async () => {
    renderChoice("?period=1y");
    expect(within(await radios()).getByRole("radio", { name: "Last year" })).toBeChecked();
  });

  it("selects the period the summary answered with when it differs from the one asked for", async () => {
    server.use(
      http.get("*/api/customers/:customerId/spending/summary", () =>
        HttpResponse.json({ ...specSummary, period: "7d" }),
      ),
    );
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderChoice("", onUrlUpdate);
    const group = await radios();
    expect(await within(group).findByRole("radio", { name: "Last 7 days" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveValue("7d");
    expect(onUrlUpdate).not.toHaveBeenCalled();
  });

  it("replaces the address, clears custom dates and goes back to page 1 when a period is chosen", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderChoice("?startDate=2024-09-01&endDate=2024-09-16&page=3&sort=amount_desc", onUrlUpdate);
    await userEvent.click(within(await radios()).getByRole("radio", { name: "Last 90 days" }));
    const update = onUrlUpdate.mock.calls[0]?.[0];
    expect(update?.queryString).toBe("?sort=amount_desc&period=90d");
    expect(update?.options.history).toBe("replace");
  });

  it("chooses from the dropdown on phones", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderChoice("", onUrlUpdate);
    await radios();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Period" }), "7d");
    expect(onUrlUpdate.mock.calls[0]?.[0].queryString).toBe("?period=7d");
  });

  it("selects no period and names the dates on the button while custom dates are on", async () => {
    renderChoice("?startDate=2024-09-01&endDate=2024-09-16");
    const group = await radios();
    expect(within(group).queryByRole("radio", { checked: true })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveValue("");
    const button = screen.getByRole("button", { name: "Custom range: 1 Sep 2024 – 16 Sep 2024" });
    expect(button).toHaveTextContent("Custom: 1 Sep 2024 – 16 Sep 2024");
  });

  it("uses the spec's options, without an error, when the filters endpoint fails", async () => {
    server.use(http.get("*/api/customers/:customerId/filters", () => HttpResponse.json({}, { status: 500 })));
    renderChoice();
    const labels = within(await radios())
      .getAllByRole("radio")
      .map((radio) => radio.closest("label")?.textContent);
    expect(labels).toEqual(["Last 7 days", "Last 30 days", "Last 90 days", "Last year"]);
    expect(screen.queryByText(/couldn't/i)).not.toBeInTheDocument();
  });
});
