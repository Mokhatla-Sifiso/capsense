import { WarningCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { TransactionList } from "./transaction-list";
import { TransactionSkeleton } from "./transaction-skeleton";

const PROBLEM = <Icon glyph={WarningCircle} size={22} />;

export function TransactionsSection(): ReactNode {
  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionList problem={PROBLEM} />
    </Suspense>
  );
}
