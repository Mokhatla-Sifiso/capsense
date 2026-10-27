import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { Brand, LOGO_PATH } from "./brand";

describe("Brand", () => {
  it.each(["rail", "top-bar"] as const)("shows the Capitec logo and the two-tone name in the %s", (placement) => {
    render(<Brand placement={placement} />);
    expect(screen.getByRole("img", { name: "Capitec" })).toHaveAttribute("src", LOGO_PATH);
    expect(screen.getByText("Cap")).toHaveClass("text-foreground");
    expect(screen.getByText("Sense")).toHaveClass("text-heading");
  });

  it("sits on the logo patch, which is white only in dark mode", () => {
    render(<Brand placement="rail" />);
    expect(screen.getByRole("img", { name: "Capitec" }).parentElement).toHaveClass("bg-logo-patch");
  });

  it("serves the official logo file unchanged", () => {
    const served = readFileSync(`public${LOGO_PATH}`);
    const official = readFileSync("docs/design/assets/capitec-logo.svg");
    expect(served.equals(official)).toBe(true);
  });
});
