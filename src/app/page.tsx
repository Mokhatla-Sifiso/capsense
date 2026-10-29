import { AboutDialog } from "@/components/about/about-dialog";
import { SpendingByCategory } from "@/components/categories/categories";
import { SpendingGoals } from "@/components/goals/goals";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReloadAtTop } from "@/components/layout/reload-at-top";
import { PeriodControl } from "@/components/period/period-control";
import { SpendingSummary } from "@/components/summary/summary";
import { ThemeRow } from "@/components/theme/theme-control";
import { MonthlyTrends } from "@/components/trends/trends";
import { Rail } from "@/components/layout/rail";
import { TopBar } from "@/components/top-bar/top-bar";
import { TransactionsSection } from "@/components/transactions/transactions";

export default function Home() {
  return (
    <>
      <ReloadAtTop />
      <DashboardLayout
        rail={<Rail learnMore={<AboutDialog opener="learn-more" />} />}
        topBar={<TopBar />}
        heading={
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <h1 className="text-h1 font-bold">Spending insights</h1>
            <PeriodControl />
          </div>
        }
        summary={<SpendingSummary />}
        categories={<SpendingByCategory />}
        trends={<MonthlyTrends />}
        goals={<SpendingGoals />}
        transactions={<TransactionsSection />}
        themeRow={<ThemeRow />}
      />
    </>
  );
}
