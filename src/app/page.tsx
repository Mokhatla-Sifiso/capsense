import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";

interface PlaceholderProps {
  name: string;
  className: string;
}

function Placeholder({ name, className }: PlaceholderProps) {
  return <section aria-label={name} className={cn("bg-card shadow-card", className)} />;
}

export default function Home() {
  return (
    <DashboardLayout
      rail={<nav aria-label="On this page" />}
      topBar={null}
      heading={<h1 className="text-h1 font-bold">Spending insights</h1>}
      summary={<Placeholder name="Spending summary" className="h-90 rounded-hero" />}
      categories={<Placeholder name="Spending by category" className="h-180 rounded-card" />}
      trends={<Placeholder name="Monthly trends" className="h-180 rounded-card" />}
      goals={<Placeholder name="Spending goals" className="h-115 rounded-card" />}
      transactions={<Placeholder name="Transactions" className="h-105 rounded-card" />}
    />
  );
}
