import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionError } from "./section-error";
import { STILL_LOADING_MS, StillLoading } from "./still-loading";
import { WarningStrip, refreshProblem } from "./warning-strip";

describe("SectionError", () => {
  it("says which section couldn't load, and Retry asks again", async () => {
    const onRetry = vi.fn();
    render(<SectionError block="goals" icon={null} onRetry={onRetry} />);
    expect(screen.getByText("Couldn't load goals")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("WarningStrip", () => {
  it("announces its message politely, and Retry asks again", async () => {
    const onRetry = vi.fn();
    render(<WarningStrip icon={null} message={refreshProblem("goals")} onRetry={onRetry} />);
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't refresh goals. Showing earlier data.");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("StillLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("says Still loading… once a section has waited 5 seconds, and stops when it arrives", () => {
    const { rerender } = render(<StillLoading pending />);
    const status = screen.getByRole("status");
    act(() => vi.advanceTimersByTime(STILL_LOADING_MS - 1));
    expect(status).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(status).toHaveTextContent("Still loading…");
    rerender(<StillLoading pending={false} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("starts counting again from zero the next time it waits", () => {
    const { rerender } = render(<StillLoading pending />);
    act(() => vi.advanceTimersByTime(STILL_LOADING_MS));
    rerender(<StillLoading pending={false} />);
    rerender(<StillLoading pending />);
    act(() => vi.advanceTimersByTime(STILL_LOADING_MS - 1));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
