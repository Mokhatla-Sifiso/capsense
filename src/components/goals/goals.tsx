import { CheckCircle, Target, Warning, WarningCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { daysInMonth } from "@/lib/goal-cards";
import { demoToday } from "@/server/demo-today";
import { GoalList } from "./goal-list";
import { GoalSkeleton } from "./goal-skeleton";

const ICONS = {
  success: <Icon glyph={CheckCircle} size={16} />,
  warning: <Icon glyph={Warning} size={16} />,
  over: <Icon glyph={WarningCircle} size={16} />,
  noBudget: <Target size={28} weight="bold" aria-hidden focusable={false} />,
  problem: <Icon glyph={WarningCircle} size={22} />,
};

async function GoalsForThisVisit(): Promise<ReactNode> {
  const today = await demoToday();
  return <GoalList monthDays={daysInMonth(today)} icons={ICONS} />;
}

export function SpendingGoals(): ReactNode {
  return (
    <Suspense fallback={<GoalSkeleton />}>
      <GoalsForThisVisit />
    </Suspense>
  );
}
