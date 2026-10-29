import type { ReactNode } from "react";

interface WarningStripProps {
  icon: ReactNode;
  message: string;
  onRetry: () => void;
}

export function WarningStrip({ icon, message, onRetry }: WarningStripProps): ReactNode {
  return (
    <div
      role="status"
      className="mt-card-gap flex items-center gap-3 rounded-panel bg-warning-surface px-4 py-3 text-warning-text"
    >
      {icon}
      <p className="flex-1 font-semibold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 font-semibold text-primary underline underline-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

export function refreshProblem(block: string): string {
  return `Couldn't refresh ${block}. Showing earlier data.`;
}
