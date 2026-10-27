import type { Icon as Glyph } from "@phosphor-icons/react";
import { ChartBar, ChartPieSlice, ListBullets, Target } from "@phosphor-icons/react/ssr";

interface PageSection {
  headingId: string;
  title: string;
  glyph: Glyph;
}

export const PAGE_SECTIONS: readonly PageSection[] = [
  { headingId: "categories-heading", title: "Spending by category", glyph: ChartPieSlice },
  { headingId: "trends-heading", title: "Monthly trends", glyph: ChartBar },
  { headingId: "goals-heading", title: "Spending goals", glyph: Target },
  { headingId: "transactions-heading", title: "Transactions", glyph: ListBullets },
];
