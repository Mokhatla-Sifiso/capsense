import type { ReactNode } from "react";
import { formatCount } from "@/lib/format";

interface PagerProps {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
  shown: number;
  busy: boolean;
  previousIcon: ReactNode;
  nextIcon: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
}

const BUTTON =
  "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill border px-6 font-semibold disabled:cursor-not-allowed disabled:border-border disabled:bg-card disabled:text-muted-foreground md:flex-none lg:min-h-11";

export function Pager({
  offset,
  limit,
  total,
  hasMore,
  shown,
  busy,
  previousIcon,
  nextIcon,
  onPrevious,
  onNext,
}: PagerProps): ReactNode {
  const canGoBack = offset > 0 && !busy;
  const canGoOn = hasMore && offset + limit < total && !busy;
  const first = formatCount(offset + 1);
  const last = formatCount(offset + shown);

  return (
    <nav aria-label="Transaction pages" className="mt-4 grid gap-3 md:flex md:items-center md:justify-between">
      <p aria-live="polite" className="text-muted-foreground">
        Showing {first}–{last} of {formatCount(total)}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={onPrevious}
          className={`${BUTTON} border-primary text-primary`}
        >
          {previousIcon}
          Previous
        </button>
        <button
          type="button"
          disabled={!canGoOn}
          onClick={onNext}
          className={`${BUTTON} border-primary bg-primary text-primary-foreground`}
        >
          Next
          {nextIcon}
        </button>
      </div>
    </nav>
  );
}
