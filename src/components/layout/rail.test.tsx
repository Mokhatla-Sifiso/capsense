import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PAGE_SECTIONS } from "./page-sections";
import { Rail } from "./rail";

function renderRail() {
  render(
    <>
      <Rail today="2024-09-16" learnMore={<button type="button">Learn more</button>} />
      {PAGE_SECTIONS.map((section) => (
        <h2 key={section.headingId} id={section.headingId} tabIndex={-1}>
          {section.title}
        </h2>
      ))}
    </>,
  );
}

describe("Rail", () => {
  it("lists the four sections under 'On this page'", () => {
    renderRail();
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav.querySelectorAll("button")).toHaveLength(4);
  });

  it.each(PAGE_SECTIONS.map((section) => section.title))(
    "moves focus to the %s heading without changing the address",
    async (title) => {
      renderRail();
      const before = window.location.href;
      await userEvent.click(screen.getByRole("button", { name: title }));
      expect(screen.getByRole("heading", { name: title })).toHaveFocus();
      expect(window.location.href).toBe(before);
    },
  );

  it("works from the keyboard", async () => {
    renderRail();
    screen.getByRole("button", { name: "Spending goals" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Spending goals" })).toHaveFocus();
  });

  it("shows the About card with the demo date and its action", () => {
    renderRail();
    expect(screen.getByText("About this demo")).toBeInTheDocument();
    expect(screen.getByText("Sample data, fixed to 16 Sep 2024. Read-only.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn more" })).toBeInTheDocument();
  });
});
