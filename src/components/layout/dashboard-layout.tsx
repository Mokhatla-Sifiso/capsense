import type { ReactNode } from "react";
import { MAIN_ID, SkipLink } from "./skip-link";

interface DashboardLayoutProps {
  rail: ReactNode;
  topBar: ReactNode;
  heading: ReactNode;
  summary: ReactNode;
  categories: ReactNode;
  trends: ReactNode;
  goals: ReactNode;
  transactions: ReactNode;
  themeRow: ReactNode;
}

export function DashboardLayout({
  rail,
  topBar,
  heading,
  summary,
  categories,
  trends,
  goals,
  transactions,
  themeRow,
}: DashboardLayoutProps): ReactNode {
  return (
    <div className="min-h-screen bg-window lg:bg-frame">
      <SkipLink />
      <div className="mx-auto grid min-h-screen w-full max-w-content lg:grid-cols-[var(--spacing-rail)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <div className="hidden lg:row-span-2 lg:block">{rail}</div>

        <header className="border-b border-border bg-frame px-4 pt-3.5 pb-4.5 md:px-6 md:pt-4.5 md:pb-5.5 lg:border-b-0 lg:pt-8 lg:pr-6 lg:pb-6 lg:pl-2">
          {topBar}
        </header>

        <main
          id={MAIN_ID}
          tabIndex={-1}
          className="min-w-0 px-gutter pt-5 pb-[calc(var(--spacing-gutter)+1rem)] outline-none md:pt-gutter lg:mr-4 lg:mb-4 lg:rounded-window lg:bg-window"
        >
          {heading}
          <div className="mt-grid grid gap-grid lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="grid min-w-0 content-start gap-grid">
              {summary}
              {categories}
            </div>
            <div className="grid min-w-0 content-start gap-grid xl:row-span-2">
              {trends}
              {goals}
            </div>
            <div className="min-w-0 lg:col-span-2 xl:col-span-1">{transactions}</div>
          </div>
          <div className="mt-grid md:hidden">{themeRow}</div>
        </main>
      </div>
    </div>
  );
}
