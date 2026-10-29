"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { SectionError } from "@/components/states/section-error";
import { StillLoading } from "@/components/states/still-loading";
import { WarningStrip, refreshProblem } from "@/components/states/warning-strip";
import { categoryAppearance } from "@/lib/category-appearance";
import { formatCurrency } from "@/lib/format";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { transactionMeta, transactionWhen, uniqueById } from "@/lib/transaction-rows";
import { transactionRequest } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { Transaction, Transactions } from "@/schemas/api";
import { Pager } from "./pager";
import { FilterLabels, RemovedCategoryNote, useClearFilters } from "./transaction-filters";
import { SkeletonRows, TRANSACTION_CARD, TransactionsHeading } from "./transaction-skeleton";

interface TransactionListProps {
  problem: ReactNode;
  filters: ReactNode;
  removeIcon: ReactNode;
  previousIcon: ReactNode;
  nextIcon: ReactNode;
  infoIcon: ReactNode;
}

interface RowProps {
  transaction: Transaction;
  currency: string;
  first: boolean;
}

interface ShownPage {
  data: Transactions;
  page: number;
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

function TableRow({ transaction, currency, first }: RowProps): ReactNode {
  const when = transactionWhen(transaction.date);
  return (
    <tr tabIndex={first ? -1 : undefined} data-first-row={first || undefined}>
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

function ListRow({ transaction, currency, first }: RowProps): ReactNode {
  const when = transactionWhen(transaction.date);
  return (
    <li
      tabIndex={first ? -1 : undefined}
      data-first-row={first || undefined}
      className="flex min-h-15 items-start gap-3 border-b border-border py-3"
    >
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
          {rows.map((transaction, index) => (
            <TableRow key={transaction.id} transaction={transaction} currency={currency} first={index === 0} />
          ))}
        </tbody>
      </table>
      <ul aria-label="Transactions" className="mt-2 md:hidden">
        {rows.map((transaction, index) => (
          <ListRow key={transaction.id} transaction={transaction} currency={currency} first={index === 0} />
        ))}
      </ul>
    </>
  );
}

function focusFirstRow(section: HTMLElement | null): void {
  const rows = section?.querySelectorAll<HTMLElement>("[data-first-row]") ?? [];
  [...rows].find((row) => row.offsetParent !== null)?.focus();
}

export function TransactionList({
  problem,
  filters,
  removeIcon,
  previousIcon,
  nextIcon,
  infoIcon,
}: TransactionListProps): ReactNode {
  const [params, setParams] = useDashboardParams();
  const transactions = useQuery(dashboardQueries.transactions(transactionRequest(params)));
  const profile = useQuery(dashboardQueries.profile());
  const { filtered, clear } = useClearFilters();
  const [shown, setShown] = useState<ShownPage | null>(null);
  const section = useRef<HTMLElement>(null);
  const paged = useRef(false);

  const fresh = transactions.data && !transactions.isPlaceholderData ? transactions.data : null;
  if (fresh && fresh !== shown?.data) setShown({ data: fresh, page: params.page });

  useEffect(() => {
    if (!paged.current) return;
    paged.current = false;
    focusFirstRow(section.current);
  }, [shown]);

  const pageFailed = transactions.isError && shown !== null && shown.page !== params.page;
  const view = transactions.data ?? (pageFailed ? shown.data : undefined);
  const loadingPage = transactions.isPlaceholderData;
  const loading = profile.isPending || (transactions.isPending && !pageFailed && !loadingPage);

  function retry(): void {
    void transactions.refetch();
    if (profile.isError) void profile.refetch();
  }

  function goTo(page: number): void {
    paged.current = true;
    void setParams({ page: page === 1 ? null : page });
  }

  function body(): ReactNode {
    if (loading) {
      return (
        <>
          <SkeletonRows />
          <StillLoading pending />
        </>
      );
    }
    if (!view || !profile.data) {
      return <SectionError block="transactions" icon={problem} onRetry={retry} className="mt-card-gap" />;
    }
    const rows = uniqueById(view.transactions);
    const pagination = view.pagination;
    if (rows.length === 0 && pagination && pagination.offset > 0 && pagination.total > 0) {
      return (
        <button
          type="button"
          onClick={() => goTo(1)}
          className="mt-card-gap min-h-12 rounded-pill border border-primary px-6 font-semibold text-primary lg:min-h-11"
        >
          Back to first page
        </button>
      );
    }
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
    return (
      <>
        {loadingPage && (
          <p role="status" className="mt-card-gap text-sm font-bold">
            Loading page…
          </p>
        )}
        {pageFailed && (
          <WarningStrip
            icon={problem}
            message={`Couldn't load page ${params.page}. Still showing page ${shown.page}.`}
            onRetry={retry}
          />
        )}
        <div aria-busy={loadingPage || undefined}>
          <Rows rows={rows} currency={profile.data.currency} />
        </div>
        {pagination && (
          <Pager
            offset={pagination.offset}
            limit={pagination.limit}
            total={pagination.total}
            hasMore={pagination.hasMore}
            shown={rows.length}
            busy={loadingPage}
            previousIcon={previousIcon}
            nextIcon={nextIcon}
            onPrevious={() => goTo(Math.max(1, params.page - 1))}
            onNext={() => goTo(params.page + 1)}
          />
        )}
      </>
    );
  }

  return (
    <section
      ref={section}
      aria-labelledby="transactions-heading"
      aria-busy={loading || undefined}
      className={TRANSACTION_CARD}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TransactionsHeading />
        {filters}
      </div>
      <FilterLabels removeIcon={removeIcon} />
      <RemovedCategoryNote infoIcon={infoIcon} />
      {transactions.isRefetchError && (
        <WarningStrip
          icon={problem}
          message={refreshProblem("transactions")}
          onRetry={() => void transactions.refetch()}
        />
      )}
      {body()}
    </section>
  );
}
