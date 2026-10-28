import type { ReactNode } from "react";

export const TRANSACTION_CARD = "rounded-card bg-card p-card shadow-card";

export function TransactionsHeading(): ReactNode {
  return (
    <h2 id="transactions-heading" tabIndex={-1} className="text-h2 font-bold">
      Transactions
    </h2>
  );
}

export function SkeletonRows(): ReactNode {
  return (
    <div aria-hidden className="mt-card-gap">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex min-h-15 animate-pulse items-center gap-3 border-b border-border py-2.5">
          <span className="size-10 shrink-0 rounded-circle bg-skeleton" />
          <span className="grid flex-1 gap-2">
            <span className="h-3.5 w-3/4 rounded-6 bg-skeleton" />
            <span className="h-3 w-1/3 rounded-6 bg-skeleton" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function TransactionSkeleton(): ReactNode {
  return (
    <section aria-labelledby="transactions-heading" aria-busy="true" className={TRANSACTION_CARD}>
      <TransactionsHeading />
      <SkeletonRows />
    </section>
  );
}
