import { AboutDialog } from "@/components/about/about-dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ThemeRow } from "@/components/theme/theme-control";
import { Rail } from "@/components/layout/rail";
import { TopBar } from "@/components/top-bar/top-bar";
import { cn } from "@/lib/utils";

interface PlaceholderProps {
  title: string;
  headingId?: string;
  className: string;
}

function Placeholder({ title, headingId, className }: PlaceholderProps) {
  return (
    <section
      aria-label={headingId ? undefined : title}
      aria-labelledby={headingId}
      className={cn("bg-card p-card shadow-card", className)}
    >
      {headingId && (
        <h2 id={headingId} tabIndex={-1} className="text-h2 font-bold">
          {title}
        </h2>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <DashboardLayout
      rail={<Rail learnMore={<AboutDialog opener="learn-more" />} />}
      topBar={<TopBar />}
      heading={<h1 className="text-h1 font-bold">Spending insights</h1>}
      summary={<Placeholder title="Spending summary" className="h-74.5 rounded-hero" />}
      categories={
        <Placeholder title="Spending by category" headingId="categories-heading" className="h-149 rounded-card" />
      }
      trends={<Placeholder title="Monthly trends" headingId="trends-heading" className="h-149 rounded-card" />}
      goals={<Placeholder title="Spending goals" headingId="goals-heading" className="h-94.5 rounded-card" />}
      transactions={<Placeholder title="Transactions" headingId="transactions-heading" className="h-87 rounded-card" />}
      themeRow={<ThemeRow />}
    />
  );
}
