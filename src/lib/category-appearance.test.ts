import { Car, FilmSlate, ForkKnife, Lightning, ShoppingBag, ShoppingCart, Tag } from "@phosphor-icons/react/ssr";
import { categoryAppearance } from "./category-appearance";

describe("categoryAppearance", () => {
  it.each([
    ["Groceries", "shopping-cart", ShoppingCart, "groceries"],
    ["Entertainment", "film", FilmSlate, "entertainment"],
    ["Transportation", "car", Car, "transportation"],
    ["Dining", "utensils", ForkKnife, "dining"],
    ["Shopping", "shopping-bag", ShoppingBag, "shopping"],
    ["Utilities", "zap", Lightning, "utilities"],
  ])("gives %s its own colour and the %s glyph", (name, icon, glyph, token) => {
    expect(categoryAppearance({ name, icon })).toEqual({
      glyph,
      background: `bg-category-${token}`,
      stroke: `stroke-category-${token}`,
    });
  });

  it("shows a category it doesn't know in grey with the tag glyph", () => {
    expect(categoryAppearance({ name: "Pets", icon: "paw" })).toEqual({
      glyph: Tag,
      background: "bg-category-neutral",
      stroke: "stroke-category-neutral",
    });
  });

  it("matches the colour by name and the glyph by icon, separately", () => {
    const appearance = categoryAppearance({ name: "Pets", icon: "car" });
    expect(appearance.glyph).toBe(Car);
    expect(appearance.background).toBe("bg-category-neutral");
  });

  it.each(["constructor", "__proto__", "toString", ""])("treats %j as unknown instead of crashing", (key) => {
    expect(categoryAppearance({ name: key, icon: key })).toEqual({
      glyph: Tag,
      background: "bg-category-neutral",
      stroke: "stroke-category-neutral",
    });
  });
});
