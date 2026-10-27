import { render, screen } from "@testing-library/react";
import { DashboardLayout } from "./dashboard-layout";

const region = (name: string) => <section aria-label={name} />;

function renderLayout() {
  return render(
    <DashboardLayout
      rail={<nav aria-label="On this page" />}
      topBar={<p>Top bar</p>}
      heading={<h1>Spending insights</h1>}
      summary={region("Summary")}
      categories={region("Categories")}
      trends={region("Trends")}
      goals={region("Goals")}
      transactions={region("Transactions")}
      themeRow={<p>Theme</p>}
    />,
  );
}

describe("DashboardLayout", () => {
  it("puts the top bar in the banner and the content in main", () => {
    renderLayout();
    expect(screen.getByRole("banner")).toHaveTextContent("Top bar");
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "Spending insights" }));
  });

  it("keeps the sections in the same reading order at every screen size", () => {
    renderLayout();
    const names = screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"));
    expect(names).toEqual(["Summary", "Categories", "Trends", "Goals", "Transactions"]);
  });

  it("puts the rail before the top bar, as the design reads", () => {
    renderLayout();
    const rail = screen.getByRole("navigation", { name: "On this page" });
    expect(rail.compareDocumentPosition(screen.getByRole("banner"))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
