import { CaretDown, CaretLeft, CaretRight, WarningCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { TrendChart } from "./trend-chart";
import { TrendSkeleton } from "./trend-skeleton";

const PROBLEM = <Icon glyph={WarningCircle} size={22} />;
const CARET = <CaretDown size={16} weight="bold" aria-hidden focusable={false} />;

export function MonthlyTrends(): ReactNode {
  return (
    <Suspense fallback={<TrendSkeleton />}>
      <TrendChart
        problem={PROBLEM}
        caretIcon={CARET}
        previousIcon={<Icon glyph={CaretLeft} size={18} />}
        nextIcon={<Icon glyph={CaretRight} size={18} />}
      />
    </Suspense>
  );
}
