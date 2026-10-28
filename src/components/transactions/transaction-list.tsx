"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { categoryAppearance } from "@/lib/category-appearance";
import { formatCurrency } from "@/lib/format";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { transactionMeta, transactionWhen, uniqueById } from "@/lib/transaction-rows";
import { transactionRequest } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { Transaction } from "@/schemas/api";
import { FilterLabels, useClearFilters } from "./transaction-filters";
import { SkeletonRows, TRANSACTION_CARD, TransactionsHeading } from "./transaction-skeleton";

interface TransactionListProps {
  problem: ReactNode;
  filters: ReactNode;
  removeIcon: ReactNode;
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

function Rows({ rows, currency }: { rows: readonly Transaction[]; currency: string }): ReactNode {
  return (
    <>
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
    </>
  );
}

export function TransactionList({ problem, filters, removeIcon }: TransactionListProps): ReactNode {
  const [params] = useDashboardParams();
  const transactions = useQuery(dashboardQueries.transactions(transactionRequest(params)));
  const profile = useQuery(dashboardQueries.profile());
  const { filtered, clear } = useClearFilters();
  const loading = transactions.isPending || profile.isPending;

  function retry(): void {
    void transactions.refetch();
    if (profile.isError) void profile.refetch();
  }

  function body(): ReactNode {
    if (loading) return <SkeletonRows />;
    if (!transactions.data || !profile.data) {
      return (
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
      );
    }
    const rows = uniqueById(transactions.data.transactions);
    const currency = profile.data.currency;
    if (rows.length === 0 && filtered) {
      return (
        <div className="mt-card-gap">
          <p className="text-muted-foreground">No transactions match these filters</p>
          <button
            type="button"
            onClick={clear}
            className="mt-4 min-h-12 rounded-pill border border-primary px-6 font-semibold text-primary lg:min-h-11"
          >
            Clear filters
          </button>
        </div>
      );
    }
    if (rows.length === 0) return <p className="mt-card-gap text-muted-foreground">No transactions in this period</p>;
    return <Rows rows={rows} currency={currency} />;
  }

  return (
    <section aria-labelledby="transactions-heading" aria-busy={loading || undefined} className={TRANSACTION_CARD}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TransactionsHeading />
        {filters}
      </div>
      <FilterLabels removeIcon={removeIcon} />
      {body()}
    </section>
  );
}
