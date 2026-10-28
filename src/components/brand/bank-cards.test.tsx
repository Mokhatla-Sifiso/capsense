import { render } from "@testing-library/react";
import { BankCards } from "./bank-cards";

describe("BankCards", () => {
  it("is decoration only: hidden from screen readers, with the Capitec logo and a masked number", () => {
    const { container } = render(<BankCards />);
    const art = container.firstElementChild;
    expect(art).toHaveAttribute("aria-hidden", "true");
    expect(art?.querySelector("img")).toHaveAttribute("src", "/brand/capitec-logo.svg");
    expect(art).toHaveTextContent(/^•••• 4821$/);
  });

  it("only shows from tablet up", () => {
    const { container } = render(<BankCards />);
    expect(container.firstElementChild).toHaveClass("hidden", "md:block");
  });
});
