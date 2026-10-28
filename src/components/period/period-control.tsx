import { CalendarBlank, CaretDown, CheckCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { PeriodChoice } from "./period-choice";
import { PeriodSkeleton } from "./period-skeleton";

export function PeriodControl(): ReactNode {
  return (
    <Suspense fallback={<PeriodSkeleton />}>
      <PeriodChoice
        checkIcon={<Icon glyph={CheckCircle} size={14} />}
        caretIcon={<CaretDown size={16} weight="bold" aria-hidden focusable={false} />}
        calendarIcon={<Icon glyph={CalendarBlank} size={20} />}
      />
    </Suspense>
  );
}
