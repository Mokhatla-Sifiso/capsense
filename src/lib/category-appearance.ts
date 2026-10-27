import type { Icon as Glyph } from "@phosphor-icons/react";
import { Car, FilmSlate, ForkKnife, Lightning, ShoppingBag, ShoppingCart, Tag } from "@phosphor-icons/react/ssr";

interface CategoryMark {
  background: string;
  stroke: string;
}

interface CategoryAppearance extends CategoryMark {
  glyph: Glyph;
}

interface CategoryKey {
  name: string;
  icon: string;
}

const GLYPHS = new Map<string, Glyph>([
  ["shopping-cart", ShoppingCart],
  ["film", FilmSlate],
  ["car", Car],
  ["utensils", ForkKnife],
  ["shopping-bag", ShoppingBag],
  ["zap", Lightning],
]);

const MARKS = new Map<string, CategoryMark>([
  ["Groceries", { background: "bg-category-groceries", stroke: "stroke-category-groceries" }],
  ["Entertainment", { background: "bg-category-entertainment", stroke: "stroke-category-entertainment" }],
  ["Transportation", { background: "bg-category-transportation", stroke: "stroke-category-transportation" }],
  ["Dining", { background: "bg-category-dining", stroke: "stroke-category-dining" }],
  ["Shopping", { background: "bg-category-shopping", stroke: "stroke-category-shopping" }],
  ["Utilities", { background: "bg-category-utilities", stroke: "stroke-category-utilities" }],
]);

const NEUTRAL: CategoryMark = { background: "bg-category-neutral", stroke: "stroke-category-neutral" };

export function categoryAppearance({ name, icon }: CategoryKey): CategoryAppearance {
  return { ...(MARKS.get(name) ?? NEUTRAL), glyph: GLYPHS.get(icon) ?? Tag };
}
