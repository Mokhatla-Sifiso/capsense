import { ShoppingCart } from "@phosphor-icons/react/ssr";
import { render } from "@testing-library/react";
import { Icon } from "./icon";

describe("Icon", () => {
  it("draws the filled glyph, hidden from screen readers and out of the tab order", () => {
    const { container } = render(<Icon glyph={ShoppingCart} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("width", "20");
  });

  it("uses the filled style, not the outline", () => {
    const filled = render(<Icon glyph={ShoppingCart} />).container.innerHTML;
    const outline = render(<ShoppingCart weight="regular" />).container.innerHTML;
    expect(filled).not.toBe(outline);
    expect(filled).toBe(
      render(<ShoppingCart weight="fill" aria-hidden focusable={false} size={20} />).container.innerHTML,
    );
  });

  it("takes a size and class", () => {
    const { container } = render(<Icon glyph={ShoppingCart} size={14} className="text-heading" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveClass("text-heading");
  });
});
