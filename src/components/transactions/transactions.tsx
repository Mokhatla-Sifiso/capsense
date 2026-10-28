import { CalendarBlank, CaretDown, CaretLeft, CaretRight, WarningCircle, XSquare } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { CustomRange } from "@/components/period/custom-range";
import { demoToday } from "@/server/demo-today";
import { TransactionFilters } from "./transaction-filters";
import { TransactionList } from "./transaction-list";
import { TransactionSkeleton } from "./transaction-skeleton";

const PROBLEM = <Icon glyph={WarningCircle} size={22} />;
const REMOVE = <Icon glyph={XSquare} size={20} />;

async function TransactionsForThisVisit(): Promise<ReactNode> {
  const today = await demoToday();
  return (
    <TransactionList
      problem={PROBLEM}
      removeIcon={REMOVE}
      previousIcon={<Icon glyph={CaretLeft} size={16} />}
      nextIcon={<Icon glyph={CaretRight} size={16} />}
      filters={
        <TransactionFilters
          caretIcon={<CaretDown size={16} weight="bold" aria-hidden focusable={false} />}
          datesOpener={
            <CustomRange
              today={today}
              opener="transactions"
              calendarIcon={<Icon glyph={CalendarBlank} size={20} />}
              problemIcon={<Icon glyph={WarningCircle} size={20} />}
            />
          }
        />
      }
    />
  );
}

export function TransactionsSection(): ReactNode {
  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionsForThisVisit />
    </Suspense>
  );
}
