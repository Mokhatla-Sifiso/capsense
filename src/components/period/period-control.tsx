import { CalendarBlank, CaretDown, CheckCircle, WarningCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { demoToday } from "@/server/demo-today";
import { CustomRange } from "./custom-range";
import { PeriodChoice } from "./period-choice";
import { PeriodSkeleton } from "./period-skeleton";

async function PeriodForThisVisit(): Promise<ReactNode> {
  const today = await demoToday();
  return (
    <PeriodChoice
      checkIcon={<Icon glyph={CheckCircle} size={14} />}
      caretIcon={<CaretDown size={16} weight="bold" aria-hidden focusable={false} />}
      customRangeOpener={
        <CustomRange
          today={today}
          calendarIcon={<Icon glyph={CalendarBlank} size={20} />}
          problemIcon={<Icon glyph={WarningCircle} size={20} />}
        />
      }
    />
  );
}

export function PeriodControl(): ReactNode {
  return (
    <Suspense fallback={<PeriodSkeleton />}>
      <PeriodForThisVisit />
    </Suspense>
  );
}
