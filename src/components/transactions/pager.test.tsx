import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pager } from "./pager";

function renderPager(overrides: Partial<Parameters<typeof Pager>[0]> = {}) {
  const props = {
    offset: 0,
    limit: 20,
    total: 1250,
    hasMore: true,
    shown: 20,
    busy: false,
    previousIcon: null,
    nextIcon: null,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    ...overrides,
  };
  render(<Pager {...props} />);
  return props;
}

const readable = (text: string | null) => (text ?? "").replace(/ /g, " ");
const previous = () => screen.getByRole("button", { name: "Previous" });
const next = () => screen.getByRole("button", { name: "Next" });

describe("Pager", () => {
  it("on page 1 of 1 250 says Showing 1–20 of 1 250, with Previous off and Next on", () => {
    renderPager();
    expect(readable(screen.getByText(/^Showing/).textContent)).toBe("Showing 1–20 of 1 250");
    expect(previous()).toBeDisabled();
    expect(next()).toBeEnabled();
  });

  it("on page 2 both are on, and they call back", async () => {
    const props = renderPager({ offset: 20 });
    expect(readable(screen.getByText(/^Showing/).textContent)).toBe("Showing 21–40 of 1 250");
    await userEvent.click(previous());
    await userEvent.click(next());
    expect(props.onPrevious).toHaveBeenCalledOnce();
    expect(props.onNext).toHaveBeenCalledOnce();
  });

  it("on the last, partial page Next is off", () => {
    renderPager({ offset: 1240, shown: 10, hasMore: false });
    expect(readable(screen.getByText(/^Showing/).textContent)).toBe("Showing 1 241–1 250 of 1 250");
    expect(next()).toBeDisabled();
  });

  it.each([
    ["more is said but the total says otherwise", { offset: 1240, hasMore: true }],
    ["the total allows more but more isn't said", { offset: 0, hasMore: false }],
  ])("keeps Next off when %s", (_case, overrides) => {
    renderPager(overrides);
    expect(next()).toBeDisabled();
  });

  it("uses the page size the API answered with", () => {
    renderPager({ limit: 50, shown: 50 });
    expect(readable(screen.getByText(/^Showing/).textContent)).toBe("Showing 1–50 of 1 250");
  });

  it("turns both off while a page loads", () => {
    renderPager({ offset: 20, busy: true });
    expect(previous()).toBeDisabled();
    expect(next()).toBeDisabled();
  });
});
