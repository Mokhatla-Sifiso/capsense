import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { CustomRange } from "./custom-range";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

function renderRange(searchParams = "", onUrlUpdate: OnUrlUpdateFunction = vi.fn()) {
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams, onUrlUpdate });
  render(
    <NuqsAdapter>
      <CustomRange today="2024-09-16" calendarIcon={null} problemIcon={null} />
    </NuqsAdapter>,
  );
}

const opener = (name: string | RegExp = "Custom range") => screen.getByRole("button", { name });
const from = () => screen.getByLabelText("From");
const to = () => screen.getByLabelText("To");

async function openAndType(start: string, end: string) {
  await userEvent.click(opener());
  if (start) await userEvent.type(from(), start);
  if (end) await userEvent.type(to(), end);
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
}

describe("CustomRange", () => {
  it("opens a window named Custom range with the limits, the two dates and the actions", async () => {
    renderRange();
    expect(opener()).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(opener());
    const dialog = screen.getByRole("dialog", { name: "Custom range" });
    expect(dialog).toHaveTextContent("Dates up to 16 Sep 2024, a range of 366 days or fewer.");
    expect(from()).toHaveAttribute("max", "2024-09-16");
    expect(to()).toHaveAttribute("max", "2024-09-16");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("keeps the window open and explains why when the start is after the end", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderRange("", onUrlUpdate);
    await openAndType("2024-09-10", "2024-09-01");
    const problem = screen.getByRole("alert");
    expect(problem).toHaveTextContent("Start date must be on or before end date");
    expect(from()).toHaveAttribute("aria-describedby", problem.id);
    expect(to()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(onUrlUpdate).not.toHaveBeenCalled();
  });

  it.each([
    ["2024-09-01", "", "Enter both a start and an end date"],
    ["2024-09-01", "2024-09-17", "Dates can't be after 16 Sep 2024"],
    ["2023-09-16", "2024-09-16", "Choose a range of 366 days or fewer"],
  ])("blocks %s to %s with “%s”", async (start, end, message) => {
    renderRange();
    await openAndType(start, end);
    expect(screen.getByRole("alert")).toHaveTextContent(message);
  });

  it("applies a valid range: dates set, preset and page cleared, no Back step, window closed", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderRange("?period=90d&page=3&sort=amount_desc", onUrlUpdate);
    await openAndType("2023-09-17", "2024-09-16");
    const update = onUrlUpdate.mock.calls[0]?.[0];
    expect(update?.queryString).toBe("?sort=amount_desc&startDate=2023-09-17&endDate=2024-09-16");
    expect(update?.options.history).toBe("replace");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener("Custom range: 17 Sep 2023 – 16 Sep 2024")).toHaveTextContent("Custom: 17 Sep 2023 – 16 Sep 2024");
  });

  it("names the applied dates on the button and fills them in when it opens again", async () => {
    renderRange("?startDate=2024-09-01&endDate=2024-09-16");
    await userEvent.click(opener("Custom range: 1 Sep 2024 – 16 Sep 2024"));
    expect(from()).toHaveValue("2024-09-01");
    expect(to()).toHaveValue("2024-09-16");
  });

  it("Cancel closes without changing anything and hands focus back to the button", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderRange("?startDate=2024-09-01&endDate=2024-09-16", onUrlUpdate);
    const button = opener("Custom range: 1 Sep 2024 – 16 Sep 2024");
    await userEvent.click(button);
    await userEvent.clear(from());
    await userEvent.type(from(), "2024-08-01");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
    expect(onUrlUpdate).not.toHaveBeenCalled();
    await userEvent.click(button);
    expect(from()).toHaveValue("2024-09-01");
  });
});
