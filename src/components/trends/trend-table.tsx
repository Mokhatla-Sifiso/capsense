import type { ReactNode } from "react";
import { formatCount, formatCurrency, formatMonth } from "@/lib/format";
import type { MonthlyTrend } from "@/schemas/api";

interface TrendTableProps {
  trends: readonly MonthlyTrend[];
  currency: string;
  open: boolean;
  onToggle: () => void;
}

const TABLE_ID = "trends-table";
const HEADER = "border-b-2 border-border px-2 pb-3 text-sm font-semibold text-muted-foreground";
const CELL = "border-b border-border px-2 py-3";
const NOTHING = "—";

export function TrendTable({ trends, currency, open, onToggle }: TrendTableProps): ReactNode {
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={TABLE_ID}
        onClick={onToggle}
        className="mt-3 min-h-11 text-control font-semibold text-primary underline underline-offset-2"
      >
        {open ? "Hide data table" : "Show data table"}
      </button>
      <table id={TABLE_ID} hidden={!open} className="mt-2 w-full border-collapse text-control tabular-nums">
        <caption className="sr-only">Monthly spending</caption>
        <thead>
          <tr>
            <th scope="col" className={`${HEADER} text-left`}>
              Month
            </th>
            <th scope="col" className={`${HEADER} text-right`}>
              Spent
            </th>
            <th scope="col" className={`${HEADER} text-right`}>
              Count
            </th>
            <th scope="col" className={`${HEADER} text-right`}>
              Average
            </th>
          </tr>
        </thead>
        <tbody>
          {trends.map((trend) => (
            <tr key={trend.month}>
              <th scope="row" className={`${CELL} text-left font-normal`}>
                {formatMonth(trend.month)}
              </th>
              <td className={`${CELL} text-right whitespace-nowrap`}>{formatCurrency(trend.totalSpent, currency)}</td>
              <td className={`${CELL} text-right`}>{formatCount(trend.transactionCount)}</td>
              <td className={`${CELL} text-right whitespace-nowrap`}>
                {trend.transactionCount === 0 ? NOTHING : formatCurrency(trend.averageTransaction, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
