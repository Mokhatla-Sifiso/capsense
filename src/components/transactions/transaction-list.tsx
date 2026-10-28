"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { categoryAppearance } from "@/lib/category-appearance";
import { formatCurrency } from "@/lib/format";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { transactionMeta, transactionWhen, uniqueById } from "@/lib/transaction-rows";
import { categoryRange, customRange, transactionParams } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { Transaction } from "@/schemas/api";
import { TRANSACTION_CARD, TransactionSkeleton, TransactionsHeading } from "./transaction-skeleton";

interface TransactionListProps {
  problem: ReactNode;
}

interface RowProps {
  transaction: Transaction;
  currency: string;
}

const NOTHING = "—";
const HEADER = "pb-3 text-sm font-semibold text-muted-foreground";
const CELL = "border-t border-border py-2.5";

function CategoryChip({ transaction }: { transaction: Transaction }): ReactNode {
  const { background, glyph: Glyph } = categoryAppearance({ name: transaction.category, icon: transaction.icon });
  return (
    <span
      aria-hidden
      className={`grid size-10 shrink-0 place-items-center rounded-circle text-chip-glyph ${background}`}
    >
      <Glyph weight="fill" size={18} focusable={false} />
    </span>
  );
}

function Names({ transaction }: { transaction: Transaction }): ReactNode {
  const primary = transaction.merchant || transaction.description;
  const secondary = transaction.merchant ? transaction.description : "";
  return (
    <span className="min-w-0">
      <span className="block truncate font-bold">{primary}</span>
      {secondary && <span className="block truncate text-sm text-muted-foreground">{secondary}</span>}
    </span>
  );
}

function TableRow({ transaction, currency }: RowProps): ReactNode {
  const when = transactionWhen(transaction.date);
  return (
    <tr>
      <td className={`${CELL} pr-4`}>
        <span className="flex min-h-10 items-center gap-3">
          <CategoryChip transaction={transaction} />
          <Names transaction={transaction} />
        </span>
      </td>
      <td className={`${CELL} pr-4`}>{transactionMeta(transaction)}</td>
      <td className={`${CELL} pr-4 whitespace-nowrap text-muted-foreground tabular-nums`}>
        {when ? `${when.day}, ${when.time}` : NOTHING}
      </td>
      <td className={`${CELL} text-right font-bold whitespace-nowrap tabular-nums`}>
        {formatCurrency(transaction.amount, currency)}
      </td>
    </tr>
  );
}

function ListRow({ transaction, currency }: RowProps): ReactNode {
  const when = transactionWhen(transaction.date);
  return (
    <li className="flex min-h-15 items-start gap-3 border-b border-border py-3">
      <CategoryChip transaction={transaction} />
      <span className="min-w-0 flex-1">
        <Names transaction={transaction} />
        <span className="block text-sm text-muted-foreground">{transactionMeta(transaction)}</span>
      </span>
      <span className="shrink-0 text-right tabular-nums">
        <span className="block font-bold whitespace-nowrap">{formatCurrency(transaction.amount, currency)}</span>
        <span className="block text-sm text-muted-foreground">{when?.day ?? NOTHING}</span>
        {when && <span className="block text-sm text-muted-foreground">{when.time}</span>}
      </span>
    </li>
  );
}

export function TransactionList({ problem }: TransactionListProps): ReactNode {
  const [params] = useDashboardParams();
  const custom = customRange(params) !== null;
  const categories = useQuery(dashboardQueries.categories(categoryRange(params)));
  const ready = custom || !categories.isPending;
  const transactions = useQuery({
    ...dashboardQueries.transactions(transactionParams(params, categories.data?.dateRange)),
    enabled: ready,
  });
  const profile = useQuery(dashboardQueries.profile());

  if (!ready || transactions.isPending || profile.isPending) return <TransactionSkeleton />;

  if (!transactions.data || !profile.data) {
    const retry = (): void => {
      void transactions.refetch();
      if (profile.isError) void profile.refetch();
    };
    return (
      <section aria-labelledby="transactions-heading" className={TRANSACTION_CARD}>
        <TransactionsHeading />
        <div className="mt-card-gap flex items-center gap-3 rounded-panel border border-danger-border p-4 md:p-5">
          <span className="text-danger-text">{problem}</span>
          <p className="flex-1 font-semibold text-danger-text">Couldn&apos;t load transactions</p>
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-pill border border-primary px-5 font-semibold text-primary"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const rows = uniqueById(transactions.data.transactions);
  const currency = profile.data.currency;

  if (rows.length === 0) {
    return (
      <section aria-labelledby="transactions-heading" className={TRANSACTION_CARD}>
        <TransactionsHeading />
        <p className="mt-3 text-muted-foreground">No transactions in this period</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="transactions-heading" className={TRANSACTION_CARD}>
      <TransactionsHeading />
      <table className="mt-card-gap hidden w-full table-fixed border-collapse text-left md:table">
        <caption className="sr-only">Transactions</caption>
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[26%]" />
          <col className="w-[20%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={HEADER}>
              Merchant
            </th>
            <th scope="col" className={HEADER}>
              Category · Payment
            </th>
            <th scope="col" className={HEADER}>
              Date
            </th>
            <th scope="col" className={`${HEADER} text-right`}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((transaction) => (
            <TableRow key={transaction.id} transaction={transaction} currency={currency} />
          ))}
        </tbody>
      </table>
      <ul aria-label="Transactions" className="mt-2 md:hidden">
        {rows.map((transaction) => (
          <ListRow key={transaction.id} transaction={transaction} currency={currency} />
        ))}
      </ul>
    </section>
  );
}
