import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitch } from "./theme-switch";

const OPTIONS = [
  { value: "light", label: "Light", icon: <svg aria-hidden /> },
  { value: "dark", label: "Dark", icon: <svg aria-hidden /> },
  { value: "system", label: "System", icon: <svg aria-hidden /> },
] as const;

describe("ThemeSwitch", () => {
  afterEach(async () => {
    const { chooseTheme } = await import("@/lib/theme");
    chooseTheme("system");
    localStorage.clear();
  });

  it("is a radio group named Theme with a spoken name for each option", () => {
    render(<ThemeSwitch options={OPTIONS} />);
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual([
      "light",
      "dark",
      "system",
    ]);
    expect(screen.getByRole("radio", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dark" })).toBeInTheDocument();
  });

  it("starts on System when nothing is saved", () => {
    render(<ThemeSwitch options={OPTIONS} />);
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
  });

  it("applies a choice at once and remembers it", async () => {
    render(<ThemeSwitch options={OPTIONS} />);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("capsense-theme")).toBe("dark");
  });

  it("moves between options with the arrow keys", async () => {
    render(<ThemeSwitch options={OPTIONS} />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "System" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
  });

  it("keeps two switches on the page in step", async () => {
    render(
      <>
        <ThemeSwitch options={OPTIONS} />
        <ThemeSwitch options={OPTIONS} />
      </>,
    );
    await userEvent.click(screen.getAllByRole("radio", { name: "Light" })[0] as HTMLElement);
    screen.getAllByRole("radio", { name: "Light" }).forEach((radio) => expect(radio).toBeChecked());
  });
});
